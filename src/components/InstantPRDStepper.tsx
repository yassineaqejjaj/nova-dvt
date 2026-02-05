 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Button } from "@/components/ui/button";
 import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
 import {
   StepIndicator,
   StepContext,
   StepConfig,
   StepGenerate,
   StepPreview,
   StepFinalize,
   FlowStep,
   PRDDocument,
   PRDConfig,
   ProductContextSummary,
   Artifact,
 } from './instant-prd';
 
 export const InstantPRDStepper = () => {
   const [currentStep, setCurrentStep] = useState<FlowStep>('context');
   const [completedSteps, setCompletedSteps] = useState<FlowStep[]>([]);
   const [isComplete, setIsComplete] = useState(false);
 
   const [selectedContext, setSelectedContext] = useState<ProductContextSummary | null>(null);
   const [selectedArtifactIds, setSelectedArtifactIds] = useState<string[]>([]);
   const [artifacts] = useState<Artifact[]>([]);
   const [idea, setIdea] = useState('');
   const [config, setConfig] = useState<PRDConfig>({
     includePersonas: true,
     includeJourneyMap: true,
     includeUserStories: true,
     detailLevel: 'standard',
   });
   const [generatedDocument, setGeneratedDocument] = useState<PRDDocument | null>(null);
 
   const markStepComplete = (step: FlowStep) => {
     if (!completedSteps.includes(step)) {
       setCompletedSteps(prev => [...prev, step]);
     }
   };
 
   const handleReset = () => {
     setCurrentStep('context');
     setCompletedSteps([]);
     setSelectedContext(null);
     setSelectedArtifactIds([]);
     setIdea('');
     setConfig({ includePersonas: true, includeJourneyMap: true, includeUserStories: true, detailLevel: 'standard' });
     setGeneratedDocument(null);
     setIsComplete(false);
   };
 
   if (isComplete) {
     return (
       <div className="container mx-auto py-8 px-4 max-w-4xl">
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
           <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
             <CheckCircle2 className="h-10 w-10 text-primary" />
           </div>
           <h1 className="text-3xl font-bold mb-4">PRD sauvegardé !</h1>
           <p className="text-muted-foreground mb-8 max-w-md mx-auto">
             Votre PRD a été enregistré et est prêt à être utilisé dans vos workflows.
           </p>
           <div className="flex items-center justify-center gap-4">
             <Button onClick={handleReset} variant="outline">Créer un autre PRD</Button>
             <Button onClick={() => window.location.href = '/'}>Retour au tableau de bord</Button>
           </div>
         </motion.div>
       </div>
     );
   }
 
   return (
     <div className="container mx-auto py-8 px-4 max-w-4xl">
       <div className="mb-8">
         <div className="flex items-center gap-4 mb-4">
           <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
             <ArrowLeft className="h-4 w-4 mr-2" />
             Retour
           </Button>
         </div>
         <h1 className="text-3xl font-bold flex items-center gap-3">
           <Sparkles className="h-8 w-8 text-primary" />
           Instant Product Requirements Document
         </h1>
         <p className="text-muted-foreground mt-2">
           Transformez une idée en PRD complet en quelques secondes
         </p>
       </div>
 
       <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
 
       <AnimatePresence mode="wait">
         <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
           {currentStep === 'context' && (
             <StepContext
               selectedContext={selectedContext}
               selectedArtifacts={selectedArtifactIds}
               onSelectContext={setSelectedContext}
               onSelectArtifacts={setSelectedArtifactIds}
               onNext={() => { markStepComplete('context'); setCurrentStep('config'); }}
             />
           )}
 
           {currentStep === 'config' && (
             <StepConfig
               idea={idea}
               config={config}
               onIdeaChange={setIdea}
               onConfigChange={setConfig}
               onNext={() => { markStepComplete('config'); setCurrentStep('generate'); }}
               onBack={() => setCurrentStep('context')}
             />
           )}
 
           {currentStep === 'generate' && (
             <StepGenerate
               idea={idea}
               context={selectedContext}
               selectedArtifactIds={selectedArtifactIds}
               artifacts={artifacts}
               config={config}
               onGenerated={(doc) => { setGeneratedDocument(doc); markStepComplete('generate'); setCurrentStep('preview'); }}
               onBack={() => setCurrentStep('config')}
             />
           )}
 
           {currentStep === 'preview' && generatedDocument && (
             <StepPreview
               document={generatedDocument}
               onDocumentChange={setGeneratedDocument}
               onNext={() => { markStepComplete('preview'); setCurrentStep('finalize'); }}
               onBack={() => setCurrentStep('generate')}
             />
           )}
 
           {currentStep === 'finalize' && generatedDocument && (
             <StepFinalize
               document={generatedDocument}
               idea={idea}
               context={selectedContext}
               onComplete={() => { markStepComplete('finalize'); setIsComplete(true); }}
               onBack={() => setCurrentStep('preview')}
             />
           )}
         </motion.div>
       </AnimatePresence>
     </div>
   );
 };
 
 export default InstantPRDStepper;