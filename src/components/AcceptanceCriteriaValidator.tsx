import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ValidationResult {
  overallScore: number;
  isTestable: boolean;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  criteria: {
    measurable: boolean;
    verifiable: boolean;
    clear: boolean;
    complete: boolean;
  };
}

export const AcceptanceCriteriaValidator = () => {
  const [content, setContent] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateCriteria = async () => {
    if (!content.trim()) {
      toast.error('Veuillez fournir des critères d\'acceptation');
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Analyze these Acceptance Criteria for testability and quality. Return JSON only:

Content:
${content}

Return this exact structure:
{
  "overallScore": 0-100,
  "isTestable": true/false,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "criteria": {
    "measurable": true/false,
    "verifiable": true/false,
    "clear": true/false,
    "complete": true/false
  }
}

Evaluate based on:
- Measurability: Can outcomes be quantified?
- Verifiability: Can success be objectively verified?
- Clarity: Are criteria unambiguous?
- Completeness: Cover all scenarios?`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const responseText = data?.response || data;
      let jsonString = typeof responseText === 'string' ? responseText : JSON.stringify(responseText);
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonString = jsonMatch[0];
      
      const validationResult = JSON.parse(jsonString);
      setResult(validationResult);
      
      if (validationResult.overallScore >= 80) {
        toast.success('Excellents critères d\'acceptation!');
      } else if (validationResult.overallScore >= 60) {
        toast.warning('Critères acceptables mais améliorables');
      } else {
        toast.error('Critères nécessitent des améliorations significatives');
      }
    } catch (error) {
      console.error('Error validating criteria:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Acceptable';
    return 'À Améliorer';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8" />
            Validateur de Critères d'Acceptation
          </h1>
          <p className="text-muted-foreground mt-2">
            Évaluez la testabilité de vos critères d'acceptation avec Nova QA Agent
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Nova QA Agent
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Critères d'Acceptation</CardTitle>
          <CardDescription>
            Collez vos critères d'acceptation pour évaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Given [context]
When [action]
Then [outcome]

Ou listez vos critères sous forme de bullet points..."
            rows={12}
          />

          <Button
            onClick={validateCriteria}
            disabled={isValidating || !content.trim()}
            className="w-full"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validation en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Valider les Critères
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Score de Testabilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Score Global</span>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}%
                  </span>
                  <Badge variant={result.isTestable ? 'default' : 'destructive'}>
                    {getScoreLabel(result.overallScore)}
                  </Badge>
                </div>
              </div>
              <Progress value={result.overallScore} className="h-3" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {Object.entries(result.criteria).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-muted rounded-lg">
                    {value ? (
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 mx-auto mb-1 text-red-600" />
                    )}
                    <p className="text-xs font-medium capitalize">{key}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {result.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  Points Forts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.weaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  Points à Améliorer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-600">✗</span>
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <AlertTriangle className="w-5 h-5" />
                  Suggestions d'Amélioration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600">→</span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};