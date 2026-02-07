 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
 import { Settings, ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
 import { PRDConfig } from './types';
 
 interface StepConfigProps {
   idea: string;
   config: PRDConfig;
   onIdeaChange: (idea: string) => void;
   onConfigChange: (config: PRDConfig) => void;
   onNext: () => void;
   onBack: () => void;
 }
 
 const StepConfig = ({
   idea,
   config,
   onIdeaChange,
   onConfigChange,
   onNext,
   onBack,
 }: StepConfigProps) => {
   const updateConfig = (key: keyof PRDConfig, value: any) => {
     onConfigChange({ ...config, [key]: value });
   };
 
    return (
      <Card className="flex flex-col min-h-[60vh]">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configurez votre PRD
          </CardTitle>
          <CardDescription>
            Décrivez votre idée et personnalisez les options de génération.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-6">
         {/* Idea Input */}
         <div className="space-y-2">
           <Label htmlFor="idea" className="flex items-center gap-2">
             <Lightbulb className="h-4 w-4 text-primary" />
             Votre idée produit
           </Label>
           <Input
             id="idea"
             placeholder="Décrivez votre idée en une phrase claire..."
             value={idea}
             onChange={(e) => onIdeaChange(e.target.value)}
             className="text-base h-12"
           />
           <p className="text-xs text-muted-foreground">
             Plus votre description est précise, plus le PRD sera pertinent.
           </p>
         </div>
 
         {/* Detail Level */}
         <div className="space-y-3">
           <Label>Niveau de détail</Label>
           <RadioGroup
             value={config.detailLevel}
             onValueChange={(val) => updateConfig('detailLevel', val)}
             className="grid grid-cols-3 gap-3"
           >
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="concise" id="concise" />
               <Label htmlFor="concise" className="cursor-pointer">Concis</Label>
             </div>
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="standard" id="standard" />
               <Label htmlFor="standard" className="cursor-pointer">Standard</Label>
             </div>
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="detailed" id="detailed" />
               <Label htmlFor="detailed" className="cursor-pointer">Détaillé</Label>
             </div>
           </RadioGroup>
         </div>
 
         {/* Sections toggles */}
         <div className="space-y-4">
           <Label>Sections à inclure</Label>
 
           <div className="flex items-center justify-between p-3 border rounded-lg">
             <div>
               <p className="font-medium text-sm">Personas</p>
               <p className="text-xs text-muted-foreground">Générer 3 personas utilisateurs</p>
             </div>
             <Switch
               checked={config.includePersonas}
               onCheckedChange={(val) => updateConfig('includePersonas', val)}
             />
           </div>
 
           <div className="flex items-center justify-between p-3 border rounded-lg">
             <div>
               <p className="font-medium text-sm">User Journey Map</p>
               <p className="text-xs text-muted-foreground">Parcours utilisateur complet</p>
             </div>
             <Switch
               checked={config.includeJourneyMap}
               onCheckedChange={(val) => updateConfig('includeJourneyMap', val)}
             />
           </div>
 
           <div className="flex items-center justify-between p-3 border rounded-lg">
             <div>
               <p className="font-medium text-sm">User Stories</p>
               <p className="text-xs text-muted-foreground">Stories avec critères d'acceptation</p>
             </div>
             <Switch
               checked={config.includeUserStories}
               onCheckedChange={(val) => updateConfig('includeUserStories', val)}
             />
           </div>
         </div>
 
         <div className="flex justify-between pt-4 mt-auto">
           <Button variant="outline" onClick={onBack}>
             <ArrowLeft className="h-4 w-4 mr-2" />
             Retour
           </Button>
           <Button onClick={onNext} disabled={!idea.trim()}>
             Générer le PRD
             <ArrowRight className="h-4 w-4 ml-2" />
           </Button>
         </div>
       </CardContent>
     </Card>
   );
 };
 
 export default StepConfig;