import { useState, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Image,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Artifact {
  id: string;
  title: string;
  artifact_type: string;
}

interface ArtifactDropZoneProps {
  selectedArtifacts: Artifact[];
  onAddClick: () => void;
  onRemove: (id: string) => void;
}

const EXAMPLE_TYPES = [
  { icon: BarChart3, label: 'KPI' },
  { icon: MessageSquare, label: 'Feedback' },
  { icon: Image, label: 'Maquette' },
  { icon: FileText, label: 'Specs' },
];

export const ArtifactDropZone: FC<ArtifactDropZoneProps> = ({
  selectedArtifacts,
  onAddClick,
  onRemove,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasArtifacts = selectedArtifacts.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "rounded-lg border-2 border-dashed transition-all duration-200",
        hasArtifacts 
          ? "border-primary/30 bg-primary/5" 
          : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30"
      )}>
        <CollapsibleTrigger asChild>
          <button 
            className="w-full p-2.5 flex items-center justify-between gap-2 text-left"
            type="button"
          >
            <div className="flex items-center gap-2">
              <Plus className={cn(
                "w-4 h-4 transition-transform",
                isOpen && "rotate-45"
              )} />
              <span className="text-sm font-medium">
                {hasArtifacts 
                  ? `${selectedArtifacts.length} artefact${selectedArtifacts.length > 1 ? 's' : ''} ancré${selectedArtifacts.length > 1 ? 's' : ''}`
                  : "Ancrer la réalité"
                }
              </span>
            </div>
            
            {!hasArtifacts && !isOpen && (
              <div className="flex items-center gap-1">
                {EXAMPLE_TYPES.map(({ icon: Icon, label }) => (
                  <Badge 
                    key={label} 
                    variant="outline" 
                    className="h-5 px-1.5 text-[10px] text-muted-foreground border-muted gap-0.5"
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {label}
                  </Badge>
                ))}
              </div>
            )}
            
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-2.5 pb-2.5 space-y-2">
            {/* Selected artifacts */}
            {hasArtifacts && (
              <div className="flex flex-wrap gap-1.5">
                {selectedArtifacts.map(artifact => (
                  <Badge 
                    key={artifact.id}
                    variant="secondary"
                    className="h-6 gap-1 pr-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="max-w-[120px] truncate">{artifact.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(artifact.id);
                      }}
                      className="ml-0.5 p-0.5 rounded hover:bg-muted-foreground/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Add button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onAddClick}
              className="w-full h-8 text-xs gap-1.5 border-dashed"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un artefact
            </Button>
            
            {/* Helper text */}
            <p className="text-[10px] text-muted-foreground text-center">
              Les artefacts ancrent la discussion dans vos données réelles
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
