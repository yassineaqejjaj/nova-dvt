 import { useState, useEffect } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Target, RefreshCw, Eye, ArrowRight, CheckCircle2, FolderOpen, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
 import { supabase } from '@/integrations/supabase/client';
 import { ProductContextSummary, Artifact } from './types';
 
 interface StepContextProps {
   selectedContext: ProductContextSummary | null;
   selectedArtifacts: string[];
   onSelectContext: (context: ProductContextSummary | null) => void;
   onSelectArtifacts: (ids: string[]) => void;
   onNext: () => void;
 }
 
 const StepContext = ({
   selectedContext,
   selectedArtifacts,
   onSelectContext,
   onSelectArtifacts,
   onNext,
 }: StepContextProps) => {
   const [contexts, setContexts] = useState<ProductContextSummary[]>([]);
   const [artifacts, setArtifacts] = useState<Artifact[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(false);
   const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);
   const [showDetails, setShowDetails] = useState(false);
 
   useEffect(() => {
     loadContexts();
   }, []);
 
   useEffect(() => {
     if (selectedContext?.id) {
       loadArtifacts(selectedContext.id);
     } else {
       setArtifacts([]);
       onSelectArtifacts([]);
     }
   }, [selectedContext?.id]);
 
   const loadContexts = async () => {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
 
       const { data, error } = await supabase
         .from('product_contexts')
         .select('id, name, vision, objectives, target_audience, constraints')
         .eq('user_id', user.id)
         .eq('is_deleted', false)
         .order('is_active', { ascending: false });
 
       if (error) throw error;
 
       const mapped = (data || []).map(ctx => ({
         id: ctx.id,
         name: ctx.name,
         vision: ctx.vision || undefined,
         objectives: ctx.objectives as string[] || [],
         target_audience: ctx.target_audience || undefined,
         constraints: ctx.constraints || undefined,
       }));
       setContexts(mapped);
 
       // Auto-select first (active) context
       if (mapped.length > 0 && !selectedContext) {
         onSelectContext(mapped[0]);
       }
     } catch (error) {
       console.error('Error loading contexts:', error);
     } finally {
       setIsLoading(false);
     }
   };
 
   const loadArtifacts = async (contextId: string) => {
     setIsLoadingArtifacts(true);
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
 
       const { data, error } = await supabase
         .from('artifacts')
         .select('id, title, artifact_type, content, created_at')
         .eq('user_id', user.id)
         .eq('product_context_id', contextId)
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       setArtifacts(data || []);
     } catch (error) {
       console.error('Error loading artifacts:', error);
     } finally {
       setIsLoadingArtifacts(false);
     }
   };
 
   const toggleArtifact = (id: string) => {
     if (selectedArtifacts.includes(id)) {
       onSelectArtifacts(selectedArtifacts.filter(a => a !== id));
     } else {
       onSelectArtifacts([...selectedArtifacts, id]);
     }
   };
 
   const getArtifactTypeLabel = (type: string) => {
     const labels: Record<string, string> = {
       'canvas': 'Canvas',
       'story': 'User Story',
       'epic': 'Epic',
       'tech_spec': 'Spec Technique',
       'roadmap': 'Roadmap',
       'prd': 'PRD',
       'impact_analysis': 'Analyse Impact',
     };
     return labels[type] || type;
   };
 
    return (
      <Card className="flex flex-col min-h-[60vh]">
        <CardHeader className="flex-shrink-0">
         <CardTitle className="flex items-center gap-2">
           <Target className="h-5 w-5 text-primary" />
           Contexte utilisé pour la génération
         </CardTitle>
         <CardDescription>
           Ce contexte sera utilisé pour cadrer le PRD généré et garantir sa pertinence.
         </CardDescription>
       </CardHeader>
       <CardContent className="flex-1 flex flex-col space-y-4">
         {isLoading ? (
           <div className="flex items-center justify-center py-8">
             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
           </div>
         ) : (
           <>
             <div className="flex items-center gap-2">
               <Select
                 value={selectedContext?.id || ''}
                 onValueChange={(val) => {
                   const ctx = contexts.find(c => c.id === val);
                   onSelectContext(ctx || null);
                 }}
               >
                 <SelectTrigger className="flex-1">
                   <SelectValue placeholder="Sélectionner un contexte..." />
                 </SelectTrigger>
                 <SelectContent>
                   {contexts.map(ctx => (
                     <SelectItem key={ctx.id} value={ctx.id}>{ctx.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <Button variant="outline" size="icon" onClick={loadContexts}>
                 <RefreshCw className="h-4 w-4" />
               </Button>
             </div>
 
             {selectedContext && (
               <div className="p-4 border rounded-lg space-y-3">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Badge variant="secondary" className="text-primary border-primary/30">
                       <CheckCircle2 className="h-3 w-3 mr-1" />
                       Contexte actif
                     </Badge>
                     <span className="font-medium">{selectedContext.name}</span>
                   </div>
                   <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
                     <Eye className="h-4 w-4 mr-1" />
                     {showDetails ? 'Masquer' : 'Voir détails'}
                   </Button>
                 </div>
 
                 {showDetails && (
                   <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                     {selectedContext.vision && (
                       <p><span className="font-medium">Vision:</span> {selectedContext.vision}</p>
                     )}
                     {selectedContext.objectives && selectedContext.objectives.length > 0 && (
                       <p><span className="font-medium">Objectifs:</span> {selectedContext.objectives.join(', ')}</p>
                     )}
                     {selectedContext.target_audience && (
                       <p><span className="font-medium">Audience:</span> {selectedContext.target_audience}</p>
                     )}
                   </div>
                 )}
               </div>
             )}
 
             {/* Artifacts */}
             {selectedContext && (
               <Collapsible open={isArtifactsOpen} onOpenChange={setIsArtifactsOpen}>
                 <CollapsibleTrigger asChild>
                   <Button variant="ghost" size="sm" className="w-full justify-between">
                     <span className="flex items-center gap-2">
                       <FolderOpen className="h-4 w-4" />
                       Artefacts du projet ({artifacts.length})
                       {selectedArtifacts.length > 0 && (
                         <Badge>{selectedArtifacts.length} sélectionné(s)</Badge>
                       )}
                     </span>
                     {isArtifactsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                   </Button>
                 </CollapsibleTrigger>
                 <CollapsibleContent className="mt-2">
                   {isLoadingArtifacts ? (
                     <div className="flex items-center justify-center py-4">
                       <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                     </div>
                   ) : artifacts.length === 0 ? (
                     <p className="text-sm text-muted-foreground text-center py-3">
                       Aucun artefact trouvé pour ce projet
                     </p>
                   ) : (
                     <ScrollArea className="h-[180px]">
                       <div className="space-y-2">
                         {artifacts.map((artifact) => (
                           <div
                             key={artifact.id}
                             onClick={() => toggleArtifact(artifact.id)}
                             className={`p-3 border rounded-md cursor-pointer transition-colors ${
                               selectedArtifacts.includes(artifact.id)
                                 ? 'border-primary bg-primary/5'
                                 : 'hover:bg-muted/50'
                             }`}
                           >
                             <div className="flex items-center justify-between">
                               <div className="flex-1 min-w-0">
                                 <p className="font-medium text-sm truncate">{artifact.title}</p>
                                 <Badge variant="outline" className="text-xs mt-1">
                                   {getArtifactTypeLabel(artifact.artifact_type)}
                                 </Badge>
                               </div>
                               {selectedArtifacts.includes(artifact.id) && (
                                 <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     </ScrollArea>
                   )}
                 </CollapsibleContent>
               </Collapsible>
             )}
           </>
         )}
 
         <div className="flex justify-end pt-4">
           <Button onClick={onNext} disabled={!selectedContext}>
             Continuer
             <ArrowRight className="h-4 w-4 ml-2" />
           </Button>
         </div>
       </CardContent>
     </Card>
   );
 };
 
 export default StepContext;