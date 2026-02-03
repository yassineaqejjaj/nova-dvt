import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Layers, Target, FileText, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { EstimationType, ESTIMATION_TYPES } from "./types";

interface StepTypeProps {
  selectedType: EstimationType | null;
  onTypeSelected: (type: EstimationType) => void;
  onNext: () => void;
  onBack: () => void;
}

const iconMap = {
  Layers,
  Target,
  FileText,
  Shuffle
};

export const StepType = ({ selectedType, onTypeSelected, onNext, onBack }: StepTypeProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Que souhaitez-vous estimer ?</h2>
        <p className="text-muted-foreground mt-2">
          Le type d'élément influence le raisonnement et la granularité des estimations
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {ESTIMATION_TYPES.map((type) => {
          const Icon = iconMap[type.icon as keyof typeof iconMap];
          const isSelected = selectedType === type.id;

          return (
            <Card
              key={type.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                isSelected && "border-primary ring-2 ring-primary/20 bg-primary/5"
              )}
              onClick={() => onTypeSelected(type.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.label}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-normal">
                    Ex: {type.example}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedType}
          className="gap-2"
        >
          Continuer
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
