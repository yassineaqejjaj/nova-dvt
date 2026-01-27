import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle2, Trash2, Zap, Target, BarChart3, Clock, Eye } from 'lucide-react';
import { ProductContext } from './useProductContexts';

interface Props {
  contexts: ProductContext[];
  isLoading: boolean;
  selectedContextId?: string | null;
  searchQuery: string;
  onSearch: (v: string) => void;
  onSelect: (ctx: ProductContext) => void;
  onNew: () => void;
  onSetActive: (id: string, e?: React.MouseEvent) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
}

export const ContextList: React.FC<Props> = ({
  contexts,
  isLoading,
  selectedContextId,
  searchQuery,
  onSearch,
  onSelect,
  onNew,
  onSetActive,
  onDelete,
}) => {
  const filtered = contexts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeContext = contexts.find(c => c.is_active);
  const inactiveContexts = filtered.filter(c => !c.is_active);

  const getLastUsed = (date: string) => {
    const updated = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Mes Contextes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{contexts.length}/10 contextes créés</p>
            </div>
            <Button onClick={onNew}>Nouveau contexte</Button>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un contexte..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {searchQuery ? 'Aucun contexte trouvé' : 'Aucun contexte. Créez-en un pour commencer!'}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Context - Premium Treatment */}
            {activeContext && filtered.some(c => c.id === activeContext.id) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Contexte actif
                </h3>
                <Card
                  className={`cursor-pointer transition-all border-2 border-primary bg-primary/5 shadow-lg hover:shadow-xl ${selectedContextId === activeContext.id ? 'ring-2 ring-primary/30' : ''}`}
                  onClick={() => onSelect(activeContext)}
                >
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg">{activeContext.name}</h4>
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Utilisé par Nova
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {activeContext.vision || 'Aucune vision définie - cliquez pour ajouter'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => onDelete(activeContext.id, e)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Usage signals */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{activeContext.objectives.length} objectifs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{activeContext.target_kpis.length} KPIs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Mis à jour {getLastUsed(activeContext.updated_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); onSelect(activeContext); }}>
                          <Eye className="w-4 h-4 mr-1" /> Voir et éditer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other Contexts */}
            {inactiveContexts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Autres contextes ({inactiveContexts.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {inactiveContexts.map((context) => (
                    <Card
                      key={context.id}
                      className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${selectedContextId === context.id ? 'border-primary shadow-md ring-2 ring-primary/20' : ''}`}
                      onClick={() => onSelect(context)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{context.name}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {getLastUsed(context.updated_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => onSetActive(context.id, e)}
                                className="text-xs h-7"
                              >
                                Activer
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => onDelete(context.id, e)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                            {context.vision || 'Aucune vision définie'}
                          </p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              {context.objectives.length}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              {context.target_kpis.length}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
