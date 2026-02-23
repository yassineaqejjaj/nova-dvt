import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImpactItem } from '../types';
import {
  Code2, TestTube2, FileText, Shield, ClipboardList,
  CheckCircle2, XCircle, Eye, Target,
} from 'lucide-react';

interface TechnicalViewProps {
  items: ImpactItem[];
  onUpdateStatus: (itemId: string, status: string) => void;
}

export const TechnicalView: React.FC<TechnicalViewProps> = ({ items, onUpdateStatus }) => {
  const technicalTypes = ['documentation', 'backlog', 'spec', 'code', 'test'];
  const filteredItems = items.filter(i => technicalTypes.includes(i.item_type));

  const grouped = filteredItems.reduce<Record<string, ImpactItem[]>>((acc, item) => {
    acc[item.item_type] = acc[item.item_type] || [];
    acc[item.item_type].push(item);
    return acc;
  }, {});

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation': return <FileText className="w-4 h-4" />;
      case 'backlog': return <ClipboardList className="w-4 h-4" />;
      case 'spec': return <Shield className="w-4 h-4" />;
      case 'code': return <Code2 className="w-4 h-4" />;
      case 'test': return <TestTube2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const typeLabels: Record<string, string> = {
    documentation: 'Documentation',
    backlog: 'Backlog',
    spec: 'Spécifications',
    code: 'Code',
    test: 'Tests',
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 4) return <Badge variant="destructive">Critique</Badge>;
    if (score >= 2) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Modéré</Badge>;
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Faible</Badge>;
  };

  if (filteredItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Code2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="font-medium">Aucun impact technique détecté</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez des liens code/tests pour enrichir la détection
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue={Object.keys(grouped)[0] || 'code'}>
      <TabsList className="flex-wrap h-auto">
        {Object.entries(grouped).map(([type, items]) => (
          <TabsTrigger key={type} value={type} className="gap-2">
            {getTypeIcon(type)}
            {typeLabels[type] || type}
            <Badge variant="secondary" className="ml-1 text-xs">{items.length}</Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {Object.entries(grouped).map(([type, typeItems]) => (
        <TabsContent key={type} value={type}>
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-3">
                  {typeItems.map(item => (
                    <Collapsible key={item.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getTypeIcon(item.item_type)}
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm truncate ${item.item_type === 'code' ? 'font-mono' : ''}`}>
                              {item.item_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{item.impact_reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {getSeverityBadge(item.impact_score)}
                          <Badge variant={
                            item.review_status === 'reviewed' ? 'default' :
                            item.review_status === 'review_required' ? 'destructive' :
                            item.review_status === 'ignored' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {item.review_status === 'review_required' ? 'À revoir' :
                             item.review_status === 'reviewed' ? 'Revu' :
                             item.review_status === 'ignored' ? 'Ignoré' : 'En attente'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateStatus(item.id, 'reviewed')}>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateStatus(item.id, 'ignored')}>
                              <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent className="px-3 pb-3">
                        <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm space-y-2">
                          <div><span className="font-medium">Raison :</span> {item.impact_reason}</div>
                          {item.metadata?.change_type && (
                            <div><span className="font-medium">Type :</span> {item.metadata.change_type}</div>
                          )}
                          {item.metadata?.entity && (
                            <div><span className="font-medium">Entité :</span> {item.metadata.entity}</div>
                          )}
                          {item.metadata?.file_path && (
                            <div><span className="font-medium">Fichier :</span> <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.metadata.file_path}</code></div>
                          )}
                          {item.metadata?.coupling != null && (
                            <div><span className="font-medium">Couplage :</span> {Math.round(item.metadata.coupling * 100)}%</div>
                          )}
                          {item.metadata?.test_file && (
                            <div><span className="font-medium">Fichier test :</span> <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.metadata.test_file}</code></div>
                          )}
                          {item.metadata?.test_type && (
                            <div><span className="font-medium">Type de test :</span> {item.metadata.test_type}</div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
};
