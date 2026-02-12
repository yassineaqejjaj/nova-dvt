import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Rocket, FileText, Copy, Plus, Calendar, User, Building2, Globe, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MissionConfig, ContextInheritance } from './types';

interface ProductContext {
  id: string;
  name: string;
  vision: string | null;
  is_active: boolean;
}

interface Props {
  config: MissionConfig;
  onConfigChange: (config: MissionConfig) => void;
  onNext: (contextAction: ContextInheritance, contextId?: string) => void;
}

export const StepActivate = ({ config, onConfigChange, onNext }: Props) => {
  const [contexts, setContexts] = useState<ProductContext[]>([]);
  const [contextAction, setContextAction] = useState<ContextInheritance>('duplicate');
  const [selectedContextId, setSelectedContextId] = useState<string | undefined>(config.associatedContextId);
  const [hasExistingContext, setHasExistingContext] = useState(false);

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('product_contexts')
      .select('id, name, vision, is_active')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false });
    if (data && data.length > 0) {
      setContexts(data);
      setHasExistingContext(true);
      const active = data.find(c => c.is_active);
      if (active) setSelectedContextId(active.id);
    }
  };

  const update = (partial: Partial<MissionConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  return (
    <Card className="min-h-[60vh] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Activer la mission
        </CardTitle>
        <p className="text-sm text-muted-foreground">Confirmez ou modifiez la configuration de votre mission.</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        {/* Mission summary form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Client</Label>
            <Input value={config.client} onChange={e => update({ client: e.target.value })} placeholder="Nom du client" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Entité</Label>
            <Input value={config.entity} onChange={e => update({ entity: e.target.value })} placeholder="Entité / BU" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Pays</Label>
            <Input value={config.country} onChange={e => update({ country: e.target.value })} placeholder="France" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />Nom de la mission</Label>
            <Input value={config.missionName} onChange={e => update({ missionName: e.target.value })} placeholder="Transformation digitale..." />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date de début</Label>
            <Input type="date" value={config.startDate} onChange={e => update({ startDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Rôle</Label>
            <Select value={config.role} onValueChange={(v) => update({ role: v as MissionConfig['role'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PM">Product Manager</SelectItem>
                <SelectItem value="Design">Designer</SelectItem>
                <SelectItem value="Dev">Développeur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {config.configuredBy && (
          <p className="text-xs text-muted-foreground">Configuré par : <span className="font-medium">{config.configuredBy}</span></p>
        )}

        <Separator />

        {/* Context inheritance */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Contexte produit</h3>
          {hasExistingContext ? (
            <>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Contexte existant détecté
                </p>
              </div>

              {/* Context selector */}
              <Select value={selectedContextId} onValueChange={setSelectedContextId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un contexte" /></SelectTrigger>
                <SelectContent>
                  {contexts.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.is_active && '(actif)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <RadioGroup value={contextAction} onValueChange={v => setContextAction(v as ContextInheritance)}>
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="inherit" id="inherit" />
                  <Label htmlFor="inherit" className="cursor-pointer flex items-center gap-2 flex-1">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Hériter tel quel</p>
                      <p className="text-xs text-muted-foreground">Utiliser le contexte sans modification</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-md border border-primary/30 bg-primary/5 cursor-pointer">
                  <RadioGroupItem value="duplicate" id="duplicate" />
                  <Label htmlFor="duplicate" className="cursor-pointer flex items-center gap-2 flex-1">
                    <Copy className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Dupliquer et modifier</p>
                      <p className="text-xs text-muted-foreground">Créer une copie personnalisable (recommandé)</p>
                    </div>
                    <Badge variant="default" className="ml-auto text-xs">Recommandé</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="create_new" id="create_new" />
                  <Label htmlFor="create_new" className="cursor-pointer flex items-center gap-2 flex-1">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Créer un nouveau contexte</p>
                      <p className="text-xs text-muted-foreground">Repartir de zéro</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </>
          ) : (
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground mb-2">Aucun contexte existant trouvé.</p>
              <p className="text-xs text-muted-foreground">Un nouveau contexte sera créé automatiquement.</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6">
          <Button
            className="w-full"
            size="lg"
            onClick={() => onNext(contextAction, selectedContextId)}
            disabled={!config.client || !config.missionName}
          >
            <Rocket className="w-4 h-4 mr-2" />
            Activer la mission
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
