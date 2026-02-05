 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Separator } from '@/components/ui/separator';
 import { Textarea } from '@/components/ui/textarea';
 import {
   ArrowLeft,
   ArrowRight,
   Edit,
   Eye,
   BookOpen,
   Target,
   AlertTriangle,
   Sparkles,
   Users,
   Map,
   Zap,
   CheckCircle2,
   Layout,
   Code2,
   TrendingUp,
   FileText,
 } from 'lucide-react';
 import { PRDDocument } from './types';
 
 interface StepPreviewProps {
   document: PRDDocument;
   onDocumentChange: (doc: PRDDocument) => void;
   onNext: () => void;
   onBack: () => void;
 }
 
 const StepPreview = ({ document, onDocumentChange, onNext, onBack }: StepPreviewProps) => {
   const [isEditMode, setIsEditMode] = useState(false);
   const [editedDocument, setEditedDocument] = useState<PRDDocument>(document);
 
   const handleSaveEdits = () => {
     onDocumentChange(editedDocument);
     setIsEditMode(false);
   };
 
   const safeText = (val: any): string => {
     if (val === null || val === undefined) return '';
     if (typeof val === 'string') return val;
     if (typeof val === 'number' || typeof val === 'boolean') return String(val);
     if (Array.isArray(val)) return val.map(safeText).join(', ');
     try { return JSON.stringify(val); } catch { return String(val); }
   };
 
   const displayDocument = isEditMode ? editedDocument : document;
 
   return (
     <Card className="max-h-[80vh] flex flex-col">
       <CardHeader className="flex-shrink-0">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2">
               <Eye className="h-5 w-5 text-primary" />
               Prévisualisation du PRD
             </CardTitle>
             <CardDescription>Vérifiez et éditez votre PRD avant de finaliser.</CardDescription>
           </div>
           <div className="flex items-center gap-2">
             {isEditMode ? (
               <>
                 <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)}>
                   Annuler
                 </Button>
                 <Button size="sm" onClick={handleSaveEdits}>
                   Sauvegarder
                 </Button>
               </>
             ) : (
               <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                 <Edit className="h-4 w-4 mr-2" />
                 Éditer
               </Button>
             )}
           </div>
         </div>
       </CardHeader>
       <CardContent className="flex-1 overflow-hidden">
         <ScrollArea className="h-[55vh] pr-4">
           <div className="space-y-6">
             {/* Introduction */}
             <div className="space-y-2">
               <h3 className="font-semibold flex items-center gap-2">
                 <BookOpen className="h-4 w-4" /> Introduction
               </h3>
               {isEditMode ? (
                 <Textarea
                   value={editedDocument.introduction}
                   onChange={(e) => setEditedDocument({ ...editedDocument, introduction: e.target.value })}
                   rows={3}
                 />
               ) : (
                 <p className="text-sm text-muted-foreground">{displayDocument.introduction}</p>
               )}
             </div>
 
             <Separator />
 
             {/* Context */}
             <div className="space-y-2">
               <h3 className="font-semibold flex items-center gap-2">
                 <Target className="h-4 w-4" /> Contexte & Objectifs
               </h3>
               {isEditMode ? (
                 <Textarea
                   value={editedDocument.context}
                   onChange={(e) => setEditedDocument({ ...editedDocument, context: e.target.value })}
                   rows={3}
                 />
               ) : (
                 <p className="text-sm text-muted-foreground">{displayDocument.context}</p>
               )}
             </div>
 
             <Separator />
 
             {/* Problem */}
             <div className="space-y-2">
               <h3 className="font-semibold flex items-center gap-2">
                 <AlertTriangle className="h-4 w-4" /> Problème à résoudre
               </h3>
               <p className="text-sm text-muted-foreground">{displayDocument.problem}</p>
             </div>
 
             <Separator />
 
             {/* Vision */}
             <div className="space-y-2">
               <h3 className="font-semibold flex items-center gap-2">
                 <Sparkles className="h-4 w-4" /> Vision produit
               </h3>
               <p className="text-sm text-muted-foreground">{displayDocument.vision}</p>
             </div>
 
             {/* Personas */}
             {displayDocument.personas.length > 0 && (
               <>
                 <Separator />
                 <div className="space-y-3">
                   <h3 className="font-semibold flex items-center gap-2">
                     <Users className="h-4 w-4" /> Personas ({displayDocument.personas.length})
                   </h3>
                   <div className="grid gap-3">
                     {displayDocument.personas.map((persona, idx) => (
                       <div key={idx} className="p-3 border rounded-lg bg-muted/30">
                         <p className="font-medium">{persona.name}</p>
                         <p className="text-xs text-muted-foreground">{persona.role}, {persona.age} ans</p>
                       </div>
                     ))}
                   </div>
                 </div>
               </>
             )}
 
             {/* Journey Map */}
             {displayDocument.userJourneyMap.length > 0 && (
               <>
                 <Separator />
                 <div className="space-y-3">
                   <h3 className="font-semibold flex items-center gap-2">
                     <Map className="h-4 w-4" /> User Journey Map
                   </h3>
                   <div className="flex gap-2 overflow-x-auto pb-2">
                     {displayDocument.userJourneyMap.map((stage, idx) => (
                       <div key={idx} className="flex-shrink-0 w-40 p-3 border rounded-lg bg-muted/30">
                         <Badge variant="secondary" className="mb-2">{idx + 1}</Badge>
                         <p className="font-medium text-sm">{stage.stage}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               </>
             )}
 
             {/* Features */}
             <Separator />
             <div className="space-y-3">
               <h3 className="font-semibold flex items-center gap-2">
                 <Zap className="h-4 w-4" /> Fonctionnalités ({displayDocument.features.length})
               </h3>
               <div className="space-y-2">
                 {displayDocument.features.map((feature, idx) => (
                   <div key={idx} className="p-3 border rounded-lg">
                     <p className="font-medium text-sm">{feature.name}</p>
                     <p className="text-xs text-muted-foreground">{feature.description}</p>
                   </div>
                 ))}
               </div>
             </div>
 
             {/* Prioritization */}
             <Separator />
             <div className="space-y-3">
               <h3 className="font-semibold flex items-center gap-2">
                 <Target className="h-4 w-4" /> Priorisation MoSCoW
               </h3>
               <div className="flex flex-wrap gap-2">
                 {displayDocument.prioritization.mvp.map((item, idx) => (
                   <Badge key={idx} variant="default">{safeText(item)}</Badge>
                 ))}
                 {displayDocument.prioritization.must.map((item, idx) => (
                   <Badge key={idx} variant="secondary">{safeText(item)}</Badge>
                 ))}
               </div>
             </div>
 
             {/* KPIs */}
             <Separator />
             <div className="space-y-3">
               <h3 className="font-semibold flex items-center gap-2">
                 <TrendingUp className="h-4 w-4" /> KPIs
               </h3>
               <ul className="space-y-1">
                 {displayDocument.kpis.map((kpi, idx) => (
                   <li key={idx} className="text-sm flex items-start gap-2">
                     <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                     {safeText(kpi)}
                   </li>
                 ))}
               </ul>
             </div>
 
             {/* Roadmap */}
             <Separator />
             <div className="space-y-3">
               <h3 className="font-semibold flex items-center gap-2">
                 <Map className="h-4 w-4" /> Roadmap
               </h3>
               <div className="space-y-2">
                 {displayDocument.roadmap.map((phase, idx) => (
                   <div key={idx} className="p-3 border rounded-lg">
                     <div className="flex items-center justify-between mb-1">
                       <p className="font-medium text-sm">{phase.phase}</p>
                       <Badge variant="outline">{phase.timeline}</Badge>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       {phase.deliverables.map(safeText).join(', ')}
                     </p>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </ScrollArea>
 
         <div className="flex justify-between pt-4 mt-4 border-t">
           <Button variant="outline" onClick={onBack}>
             <ArrowLeft className="h-4 w-4 mr-2" />
             Régénérer
           </Button>
           <Button onClick={onNext}>
             Finaliser
             <ArrowRight className="h-4 w-4 ml-2" />
           </Button>
         </div>
       </CardContent>
     </Card>
   );
 };
 
 export default StepPreview;