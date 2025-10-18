import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserStory {
  id: string;
  title: string;
  story: {
    asA: string;
    iWant: string;
    soThat: string;
  };
  acceptanceCriteria: string[];
  effortPoints: number;
  priority: 'high' | 'medium' | 'low';
  technicalNotes?: string;
  dependencies: string[];
}

interface StoryCardProps {
  story: UserStory;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onToggleInclude?: (included: boolean) => void;
  showCheckbox?: boolean;
  isIncluded?: boolean;
}

const priorityConfig = {
  high: { label: 'Haute', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  medium: { label: 'Moyenne', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  low: { label: 'Basse', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' }
};

const StoryCard = ({
  story,
  expanded = false,
  onToggleExpand,
  onEdit,
  onRemove,
  onToggleInclude,
  showCheckbox = false,
  isIncluded = true
}: StoryCardProps) => {
  const priorityStyle = priorityConfig[story.priority];

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      !isIncluded && "opacity-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {showCheckbox && onToggleInclude && (
            <Checkbox
              checked={isIncluded}
              onCheckedChange={onToggleInclude}
              className="mt-1"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {onToggleExpand && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleExpand}
                    className="h-6 w-6 p-0 shrink-0"
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <h3 className="font-semibold text-base flex-1">{story.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge className={priorityStyle.className} variant="outline">
                  {priorityStyle.label}
                </Badge>
                <Badge variant="secondary">
                  {story.effortPoints} pts
                </Badge>
              </div>
            </div>

            {expanded && (
              <div className="space-y-3 mt-4 pl-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User Story:</p>
                  <p className="text-sm">
                    <span className="font-medium">En tant que</span> {story.story.asA},{' '}
                    <span className="font-medium">Je veux</span> {story.story.iWant},{' '}
                    <span className="font-medium">Afin de</span> {story.story.soThat}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Critères d'Acceptation :</p>
                  <ul className="space-y-1">
                    {story.acceptanceCriteria.map((criteria, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {story.technicalNotes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes Techniques :</p>
                    <p className="text-sm text-muted-foreground">{story.technicalNotes}</p>
                  </div>
                )}

                {story.dependencies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Dépendances :</p>
                    <div className="flex flex-wrap gap-1">
                      {story.dependencies.map(dep => (
                        <Badge key={dep} variant="outline" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-1 shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryCard;
