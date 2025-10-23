import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle2, Trash2 } from 'lucide-react';
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Mes Contextes ({contexts.length}/10)</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Button onClick={onNew}>
            Nouveau contexte
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((context) => (
              <Card
                key={context.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedContextId === context.id ? 'border-primary shadow-md ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                onClick={() => onSelect(context)}
              >
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{context.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Mis à jour {new Date(context.updated_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {context.is_active && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Actif
                          </Badge>
                        )}
                        {!context.is_active && (
                          <Button variant="outline" size="sm" onClick={(e) => onSetActive(context.id, e)}>
                            Définir actif
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={(e) => onDelete(context.id, e)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {context.vision || 'Aucune vision définie'}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{context.objectives.length} objectifs</Badge>
                      <Badge variant="outline" className="text-xs">{context.target_kpis.length} KPIs</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
