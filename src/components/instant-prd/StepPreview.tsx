import { useState, useMemo } from 'react';
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
 
// Helper to safely extract text from any value (including objects)
const extractText = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return val.map(extractText).join(', ');
  if (typeof val === 'object') {
    if (val.name) return val.name;
    if (val.title) return val.title;
    if (val.description) return val.description;
    try { 
      const str = JSON.stringify(val);
      if (str.length < 200) return str.replace(/[{}"]/g, '').replace(/,/g, ', ');
      return '';
    } catch { return ''; }
  }
  return String(val);
};

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
 
   const displayDocument = isEditMode ? editedDocument : document;
 
  const normalizedPrioritization = useMemo(() => {
    const prio = displayDocument.prioritization;
    return {
      mvp: (prio?.mvp || []).map(extractText).filter(Boolean),
      must: (prio?.must || []).map(extractText).filter(Boolean),
      should: (prio?.should || []).map(extractText).filter(Boolean),
      could: (prio?.could || []).map(extractText).filter(Boolean),
      wont: (prio?.wont || []).map(extractText).filter(Boolean),
    };
  }, [displayDocument.prioritization]);

   return (
    <Card className="flex flex-col">
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
         <ScrollArea className="h-[65vh] pr-4">
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
                    <div className="grid gap-4">
                      {displayDocument.personas.map((persona, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-muted/30 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-lg">{persona.name}</p>
                              <p className="text-sm text-muted-foreground">{persona.role}, {persona.age} ans</p>
                            </div>
                            <Badge variant="outline">Persona {idx + 1}</Badge>
                          </div>
                          
                          {persona.bio && (
                            <p className="text-sm italic text-muted-foreground border-l-2 border-primary/50 pl-3">
                              {persona.bio}
                            </p>
                          )}
                          
                          {persona.quote && (
                            <p className="text-sm italic">"{persona.quote}"</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Objectifs</p>
                              <ul className="space-y-1">
                                {persona.goals.map((g, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Target className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                    {g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Points de friction</p>
                              <ul className="space-y-1">
                                {persona.painPoints.map((p, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <AlertTriangle className="h-3 w-3 text-destructive mt-1 flex-shrink-0" />
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {(persona.motivations?.length || persona.behaviors?.length) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {persona.motivations?.length > 0 && (
                                <div>
                                  <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Motivations</p>
                                  <ul className="space-y-1">
                                    {persona.motivations.map((m, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <Sparkles className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                        {m}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {persona.behaviors?.length > 0 && (
                                <div>
                                  <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Comportements</p>
                                  <ul className="space-y-1">
                                    {persona.behaviors.map((b, i) => (
                                      <li key={i} className="text-muted-foreground">{b}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
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
                        <div key={idx} className="flex-shrink-0 w-48 p-3 border rounded-lg bg-muted/30 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{idx + 1}</Badge>
                            <p className="font-medium text-sm">{stage.stage}</p>
                          </div>
                          {stage.emotions && (
                            <Badge variant={stage.emotions === 'positive' ? 'default' : stage.emotions === 'negative' ? 'destructive' : 'outline'}>
                              {stage.emotions}
                            </Badge>
                          )}
                          {stage.actions.length > 0 && (
                            <div className="text-xs">
                              <p className="font-medium text-muted-foreground">Actions:</p>
                              <ul className="text-muted-foreground">
                                {stage.actions.slice(0, 2).map((a, i) => <li key={i}>• {a}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Features (Epics) with User Stories */}
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Fonctionnalités / Epics ({displayDocument.features.length})
                </h3>
                <div className="space-y-4">
                  {displayDocument.features.map((feature, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge variant="outline" className="mb-1">{feature.id}</Badge>
                            <p className="font-semibold">{feature.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                        
                        {feature.businessValue && (
                          <p className="text-sm mt-2">
                            <span className="font-medium">Valeur métier:</span> {feature.businessValue}
                          </p>
                        )}
                        
                        {feature.dependencies?.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {feature.dependencies.map((d, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* User Stories for this feature */}
                      {feature.userStories && feature.userStories.length > 0 && (
                        <div className="p-3 bg-background space-y-2">
                          <p className="text-xs font-medium uppercase text-muted-foreground">
                            User Stories ({feature.userStories.length})
                          </p>
                          {feature.userStories.map((story, sIdx) => (
                            <div key={sIdx} className="p-3 border rounded-lg text-sm space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">{story.id}</Badge>
                                    <Badge 
                                      variant={story.priority === 'high' ? 'destructive' : story.priority === 'medium' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {story.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">{story.complexity}</Badge>
                                    {story.storyPoints && (
                                      <Badge variant="secondary" className="text-xs">{story.storyPoints} pts</Badge>
                                    )}
                                  </div>
                                  <p className="font-medium">{story.title}</p>
                                </div>
                              </div>
                              
                              {(story.asA || story.iWant || story.soThat) && (
                                <div className="bg-muted/50 p-2 rounded text-xs space-y-1">
                                  {story.asA && <p><strong>En tant que</strong> {story.asA}</p>}
                                  {story.iWant && <p><strong>Je veux</strong> {story.iWant}</p>}
                                  {story.soThat && <p><strong>Afin de</strong> {story.soThat}</p>}
                                </div>
                              )}
                              
                              {story.acceptanceCriteria.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Critères d'acceptation:</p>
                                  <ul className="space-y-1">
                                    {story.acceptanceCriteria.map((ac, acIdx) => (
                                      <li key={acIdx} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                        {ac}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {story.technicalNotes && (
                                <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">
                                  <strong>Notes techniques:</strong> {story.technicalNotes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {normalizedPrioritization.mvp.length > 0 && (
                  <div className="p-3 border rounded-lg bg-primary/10">
                    <p className="text-xs font-medium text-primary mb-2">MVP</p>
                    <div className="flex flex-wrap gap-1">
                      {normalizedPrioritization.mvp.map((item, idx) => (
                        <Badge key={idx} variant="default">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {normalizedPrioritization.must.length > 0 && (
                  <div className="p-3 border rounded-lg bg-secondary/30">
                    <p className="text-xs font-medium mb-2">Must Have</p>
                    <div className="flex flex-wrap gap-1">
                      {normalizedPrioritization.must.map((item, idx) => (
                        <Badge key={idx} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {normalizedPrioritization.should.length > 0 && (
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Should Have</p>
                    <div className="flex flex-wrap gap-1">
                      {normalizedPrioritization.should.map((item, idx) => (
                        <Badge key={idx} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {normalizedPrioritization.could.length > 0 && (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Could Have</p>
                    <div className="flex flex-wrap gap-1">
                      {normalizedPrioritization.could.map((item, idx) => (
                        <Badge key={idx} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
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
                    {extractText(kpi)}
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
                    {phase.deliverables.map(extractText).join(', ')}
                     </p>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </ScrollArea>
 
          <div className="flex justify-between p-4 border-t">
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