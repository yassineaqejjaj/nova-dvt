import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { FileText, Search, CheckCircle2, Target, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductContext {
  id: string;
  name: string;
  vision: string | null;
  objectives: string[];
  target_kpis: string[];
  constraints: string | null;
  target_audience: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ContextSelectorProps {
  onContextSelected: (context: ProductContext) => void;
  selectedContextId?: string | null;
}

export const ContextSelector = ({ onContextSelected, selectedContextId }: ContextSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contexts, setContexts] = useState<ProductContext[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContext, setSelectedContext] = useState<ProductContext | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadContexts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedContextId && contexts.length > 0) {
      const context = contexts.find(c => c.id === selectedContextId);
      if (context) {
        setSelectedContext(context);
      }
    }
  }, [selectedContextId, contexts]);

  const loadContexts = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      const { data, error } = await supabase
        .from('product_contexts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const typedContexts: ProductContext[] = (data || []).map(ctx => ({
        id: ctx.id,
        name: ctx.name,
        vision: ctx.vision || null,
        objectives: Array.isArray(ctx.objectives) ? (ctx.objectives as string[]) : [],
        target_kpis: Array.isArray(ctx.target_kpis) ? (ctx.target_kpis as string[]) : [],
        constraints: ctx.constraints || null,
        target_audience: ctx.target_audience || null,
        is_active: ctx.is_active,
        created_at: ctx.created_at,
        updated_at: ctx.updated_at,
      }));

      setContexts(typedContexts);
    } catch (error) {
      console.error('Error loading contexts:', error);
      toast.error('Erreur lors du chargement des contextes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (context: ProductContext) => {
    setSelectedContext(context);
    onContextSelected(context);
    setIsOpen(false);
    toast.success(`Contexte "${context.name}" importé`);
  };

  const filteredContexts = contexts.filter(ctx =>
    ctx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ctx.vision?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        {selectedContext ? `Contexte: ${selectedContext.name}` : 'Importer un contexte'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Importer un contexte produit</DialogTitle>
            <DialogDescription>
              Sélectionnez un contexte produit existant pour pré-remplir le formulaire
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contexte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              ) : filteredContexts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Aucun contexte trouvé' : 'Aucun contexte disponible'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Créez un contexte depuis les paramètres
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredContexts.map((context) => (
                    <Card
                      key={context.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleSelect(context)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {context.name}
                              {context.is_active && (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Actif
                                </Badge>
                              )}
                            </CardTitle>
                            {context.vision && (
                              <CardDescription className="mt-1 line-clamp-2">
                                {context.vision}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {context.objectives.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Target className="h-3 w-3 mr-1" />
                              {context.objectives.length} objectif(s)
                            </Badge>
                          )}
                          {context.target_audience && (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {context.target_audience}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
