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
      toast.error('Please enter a research query');
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
      toast.success('Market research completed!');
    } catch (error: any) {
      console.error('Market research error:', error);
      toast.error('Failed to complete market research', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Market Research Tool</h2>
        <p className="text-muted-foreground">
          Gather competitive intelligence and market insights using AI-powered web research
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Research Parameters</span>
          </CardTitle>
          <CardDescription>
            Enter your research topic and provide context for better results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Research Query *</Label>
              <Input
                id="query"
                placeholder="e.g., AI-powered task management tools"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea
                id="context"
                placeholder="e.g., Target audience: small teams, Focus on: collaboration features"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Start Research
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
                  <span>Executive Summary</span>
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
                  <span>Competitive Analysis</span>
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
                            <p className="text-sm font-medium mb-2 text-green-600">Strengths</p>
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
                            <p className="text-sm font-medium mb-2 text-orange-600">Weaknesses</p>
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
                    <span>Market Trends</span>
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
                    <span>Opportunities</span>
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
                  <span>User Needs & Pain Points</span>
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