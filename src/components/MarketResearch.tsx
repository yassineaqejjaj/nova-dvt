import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Globe, TrendingUp, Users, AlertCircle, Loader2 } from 'lucide-react';

interface ResearchResult {
  competitors?: Array<{
    name: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  trends?: string[];
  userNeeds?: string[];
  opportunities?: string[];
  summary?: string;
}

export const MarketResearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult | null>(null);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Veuillez saisir une requête de recherche');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('market-research', {
        body: { query: query.trim(), context: context.trim() }
      });

      if (error) throw error;

      setResults(data.results);
      toast.success('Étude de marché terminée !');
    } catch (error: any) {
      console.error('Market research error:', error);
      toast.error('Échec de l\'étude de marché', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Étude de marché IA</h2>
        <p className="text-muted-foreground">
          Collectez de l'intelligence concurrentielle et des insights marché avec une recherche web propulsée par IA
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Paramètres de recherche</span>
          </CardTitle>
          <CardDescription>
            Saisissez votre sujet de recherche et fournissez du contexte pour de meilleurs résultats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Requête de recherche *</Label>
              <Input
                id="query"
                placeholder="ex: Outils de gestion de tâches propulsés par IA"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Contexte additionnel (Optionnel)</Label>
              <Textarea
                id="context"
                placeholder="ex: Public cible: petites équipes, Focus: fonctionnalités de collaboration"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Démarrer la recherche
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          {results.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <span>Synthèse exécutive</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{results.summary}</p>
              </CardContent>
            </Card>
          )}

          {results.competitors && results.competitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-agent-blue" />
                  <span>Analyse concurrentielle</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {results.competitors.map((competitor, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">{competitor.name}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2 text-green-600">Forces</p>
                            <ul className="space-y-1">
                              {competitor.strengths.map((strength, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start">
                                  <span className="text-green-500 mr-2">✓</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2 text-orange-600">Faiblesses</p>
                            <ul className="space-y-1">
                              {competitor.weaknesses.map((weakness, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start">
                                  <span className="text-orange-500 mr-2">!</span>
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {results.trends && results.trends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-agent-green" />
                    <span>Tendances du marché</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.trends.map((trend, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Badge variant="outline" className="mt-0.5">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {results.opportunities && results.opportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-agent-orange" />
                    <span>Opportunités</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.opportunities.map((opp, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-primary font-bold mt-0.5">→</span>
                        <span className="text-sm">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {results.userNeeds && results.userNeeds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-agent-purple" />
                  <span>Besoins utilisateurs & Points de douleur</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-2">
                  {results.userNeeds.map((need, idx) => (
                    <li key={idx} className="flex items-start space-x-2 p-2 rounded bg-muted/30">
                      <span className="text-primary">•</span>
                      <span className="text-sm">{need}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};