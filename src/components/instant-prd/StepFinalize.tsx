 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Label } from '@/components/ui/label';
 import { ArrowLeft, Save, Download, FileText, CheckCircle2, Loader2 } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { PRDDocument, ProductContextSummary } from './types';
 
 interface StepFinalizeProps {
   document: PRDDocument;
   idea: string;
   context: ProductContextSummary | null;
   onComplete: () => void;
   onBack: () => void;
 }
 
 const StepFinalize = ({ document, idea, context, onComplete, onBack }: StepFinalizeProps) => {
   const [isSaving, setIsSaving] = useState(false);
   const [saveToArtifacts, setSaveToArtifacts] = useState(true);
   const [saveToPrds, setSaveToPrds] = useState(true);
   const [savedPrdId, setSavedPrdId] = useState<string | null>(null);
 
   const handleSave = async () => {
     setIsSaving(true);
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
         toast.error('Vous devez être connecté');
         return;
       }
 
       let prdId: string | null = null;
 
       // Save to PRDs table
       if (saveToPrds) {
         const { data, error } = await supabase
           .from('prds')
           .insert({
             user_id: user.id,
             title: `PRD: ${idea.slice(0, 50)}`,
             idea_description: idea,
             document_content: document as any,
             product_context_id: context?.id || null,
           })
           .select('id')
           .single();
 
         if (error) throw error;
         prdId = data?.id || null;
         setSavedPrdId(prdId);
       }
 
       // Save to Artifacts table
       if (saveToArtifacts) {
        const { error } = await supabase.from('artifacts').insert([{
           user_id: user.id,
           title: `PRD: ${idea.slice(0, 50)}`,
          artifact_type: 'canvas' as const,
           content: document as any,
           product_context_id: context?.id || null,
           prd_id: prdId,
           metadata: { source: 'instant-prd', idea },
        }]);
 
         if (error) throw error;
       }
 
       toast.success('PRD sauvegardé avec succès !');
       onComplete();
     } catch (error) {
       console.error('Error saving PRD:', error);
       toast.error('Erreur lors de la sauvegarde');
     } finally {
       setIsSaving(false);
     }
   };
 
   const handleDownload = () => {
     const content = JSON.stringify(document, null, 2);
     const blob = new Blob([content], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = window.document.createElement('a');
     a.href = url;
     a.download = `prd-${idea.slice(0, 20).replace(/\s+/g, '-')}.json`;
     a.click();
     URL.revokeObjectURL(url);
     toast.success('PRD téléchargé');
   };
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <Save className="h-5 w-5 text-primary" />
           Finalisation
         </CardTitle>
         <CardDescription>
           Choisissez où sauvegarder votre PRD.
         </CardDescription>
       </CardHeader>
       <CardContent className="space-y-6">
         <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
           <div className="flex items-center gap-2">
             <FileText className="h-5 w-5 text-primary" />
             <span className="font-medium">PRD: {idea.slice(0, 50)}{idea.length > 50 ? '...' : ''}</span>
           </div>
           <div className="text-sm text-muted-foreground">
             <p>{document.features.length} fonctionnalités</p>
             <p>{document.personas.length} personas</p>
             <p>{document.roadmap.length} phases dans la roadmap</p>
           </div>
         </div>
 
         <div className="space-y-4">
           <div className="flex items-center space-x-2">
             <Checkbox
               id="saveToPrds"
               checked={saveToPrds}
               onCheckedChange={(checked) => setSaveToPrds(checked as boolean)}
             />
             <Label htmlFor="saveToPrds" className="cursor-pointer">
               Sauvegarder dans "Mes PRDs"
             </Label>
           </div>
 
           <div className="flex items-center space-x-2">
             <Checkbox
               id="saveToArtifacts"
               checked={saveToArtifacts}
               onCheckedChange={(checked) => setSaveToArtifacts(checked as boolean)}
             />
             <Label htmlFor="saveToArtifacts" className="cursor-pointer">
               Sauvegarder comme artefact
             </Label>
           </div>
         </div>
 
         <div className="flex items-center gap-3 pt-4">
           <Button variant="outline" onClick={handleDownload}>
             <Download className="h-4 w-4 mr-2" />
             Télécharger JSON
           </Button>
         </div>
 
         <div className="flex justify-between pt-4 border-t">
           <Button variant="outline" onClick={onBack}>
             <ArrowLeft className="h-4 w-4 mr-2" />
             Retour
           </Button>
           <Button onClick={handleSave} disabled={isSaving || (!saveToPrds && !saveToArtifacts)}>
             {isSaving ? (
               <>
                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                 Sauvegarde...
               </>
             ) : (
               <>
                 <CheckCircle2 className="h-4 w-4 mr-2" />
                 Sauvegarder
               </>
             )}
           </Button>
         </div>
       </CardContent>
     </Card>
   );
 };
 
 export default StepFinalize;