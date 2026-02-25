import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Sparkles, Check, X, Link2, Code2, TestTube2, Database, FileText, Loader2
} from 'lucide-react';

interface LinkSuggestion {
  id: string;
  artefact_id: string;
  suggested_target_type: string;
  suggested_target_id: string;
  suggested_link_type: string;
  confidence: number;
  reasoning: string;
  status: string;
  created_at: string;
}

interface LinkSuggestionsProps {
  artefactId: string;
  onAccepted?: () => void;
}

export const LinkSuggestions: React.FC<LinkSuggestionsProps> = ({ artefactId, onAccepted }) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [artefactId]);

  const loadSuggestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('link_suggestions' as any)
      .select('*')
      .eq('artefact_id', artefactId)
      .eq('status', 'pending')
      .order('confidence', { ascending: false });
    setSuggestions((data || []) as unknown as LinkSuggestion[]);
    setLoading(false);
  };

  const acceptSuggestion = async (suggestion: LinkSuggestion) => {
    if (!user?.id) return;

    // Create the actual link based on target type
    if (suggestion.suggested_target_type === 'code') {
      await supabase.from('feature_code_map' as any).insert({
        feature_id: artefactId,
        file_path: suggestion.suggested_target_id,
        confidence: suggestion.confidence,
        link_source: 'ai_suggested',
        user_id: user.id,
      } as any);
    } else if (suggestion.suggested_target_type === 'data') {
      await supabase.from('feature_data_map' as any).insert({
        feature_id: artefactId,
        table_name: suggestion.suggested_target_id,
        confidence: suggestion.confidence,
        link_source: 'ai_suggested',
        user_id: user.id,
      } as any);
    } else if (suggestion.suggested_target_type === 'artefact') {
      await supabase.from('artefact_links').insert({
        source_id: artefactId,
        target_type: 'artefact',
        target_id: suggestion.suggested_target_id,
        link_type: suggestion.suggested_link_type,
        confidence_score: suggestion.confidence,
        user_id: user.id,
      });
    }

    // Update suggestion status
    await supabase.from('link_suggestions' as any)
      .update({ status: 'accepted' } as any)
      .eq('id', suggestion.id);

    toast.success('Lien accepté et créé');
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    onAccepted?.();
  };

  const rejectSuggestion = async (suggestion: LinkSuggestion) => {
    await supabase.from('link_suggestions' as any)
      .update({ status: 'rejected' } as any)
      .eq('id', suggestion.id);

    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    toast.info('Suggestion ignorée');
  };

  const generateSuggestions = async () => {
    if (!user?.id) return;
    setGenerating(true);

    try {
      // Fetch artifact content
      const { data: artifact } = await supabase
        .from('artifacts').select('content, title, artifact_type, product_context_id')
        .eq('id', artefactId).single();

      if (!artifact) throw new Error('Artefact introuvable');

      // Fetch existing code_index, test_index, data_index for context
      const [codeRes, dataRes] = await Promise.all([
        supabase.from('code_index' as any).select('file_path, symbols, description').eq('user_id', user.id).limit(50),
        supabase.from('data_index' as any).select('table_name, columns, description').eq('user_id', user.id).limit(50),
      ]);

      const codeEntries = (codeRes.data || []) as any[];
      const dataEntries = (dataRes.data || []) as any[];

      // Call LLM via edge function for suggestions
      const { data: funcData, error } = await supabase.functions.invoke('analyze-impact', {
        body: {
          artefactId,
          newContent: artifact.content,
          userId: user.id,
          generateLinkSuggestions: true,
          codeIndex: codeEntries.map((c: any) => c.file_path),
          dataIndex: dataEntries.map((d: any) => d.table_name),
        },
      });

      if (error) throw error;

      // If the edge function returned suggestions, they should be in the DB already
      await loadSuggestions();
      toast.success('Suggestions générées par Nova');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code2 className="w-4 h-4 text-primary" />;
      case 'test': return <TestTube2 className="w-4 h-4 text-emerald-500" />;
      case 'data': return <Database className="w-4 h-4 text-amber-500" />;
      case 'artefact': return <FileText className="w-4 h-4 text-blue-500" />;
      default: return <Link2 className="w-4 h-4" />;
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Suggestions de liens
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Nova propose des liens basés sur l'analyse du contenu
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={generateSuggestions} disabled={generating}>
            {generating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Générer
          </Button>
        </div>
      </CardHeader>
      {suggestions.length > 0 && (
        <CardContent>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {suggestions.map(s => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  {getTypeIcon(s.suggested_target_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{s.suggested_target_id}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{s.suggested_link_type}</Badge>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {Math.round(s.confidence * 100)}%
                      </Badge>
                    </div>
                    {s.reasoning && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.reasoning}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => acceptSuggestion(s)}>
                      <Check className="w-4 h-4 text-emerald-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => rejectSuggestion(s)}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};
