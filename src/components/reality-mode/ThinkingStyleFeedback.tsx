import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Lock, 
  Eye,
  EyeOff,
  Lightbulb,
  AlertTriangle,
  Handshake,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { UserThinkingStyle } from './types';

interface ThinkingStyleFeedbackProps {
  userId: string;
}

export const ThinkingStyleFeedback: React.FC<ThinkingStyleFeedbackProps> = ({ userId }) => {
  const [style, setStyle] = useState<UserThinkingStyle | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadStyle();
  }, [userId]);

  const loadStyle = async () => {
    try {
      const { data, error } = await supabase
        .from('user_thinking_analytics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setStyle({
          optIn: data.opt_in,
          debatesParticipated: data.debates_participated,
          earlyAgreementRate: Number(data.early_agreement_rate),
          riskRaisingRate: Number(data.risk_raising_rate),
          alternativeProposalRate: Number(data.alternative_proposal_rate),
          synthesisContributionRate: Number(data.synthesis_contribution_rate),
          ideationContributionRate: Number(data.ideation_contribution_rate),
          strongestImpactArea: data.strongest_impact_area as any,
          insights: data.insights as string[]
        });
      }
    } catch (error) {
      console.error('Error loading thinking style:', error);
    }
  };

  const toggleOptIn = async () => {
    setLoading(true);
    try {
      const newOptIn = !style?.optIn;
      
      const { error } = await supabase
        .from('user_thinking_analytics')
        .upsert({
          user_id: userId,
          opt_in: newOptIn
        });

      if (error) throw error;

      setStyle(prev => prev ? { ...prev, optIn: newOptIn } : {
        optIn: newOptIn,
        debatesParticipated: 0,
        earlyAgreementRate: 0,
        riskRaisingRate: 0,
        alternativeProposalRate: 0,
        synthesisContributionRate: 0,
        ideationContributionRate: 0,
        strongestImpactArea: null,
        insights: []
      });

      toast({
        title: newOptIn ? "Analytics activées" : "Analytics désactivées",
        description: newOptIn 
          ? "Vos insights de style de pensée seront générés" 
          : "Vos données de style ne seront plus collectées"
      });
    } catch (error) {
      console.error('Error toggling opt-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactIcon = (area: string | null) => {
    switch (area) {
      case 'synthesis': return <Sparkles className="w-4 h-4" />;
      case 'ideation': return <Lightbulb className="w-4 h-4" />;
      case 'risks': return <AlertTriangle className="w-4 h-4" />;
      case 'proposals': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getImpactLabel = (area: string | null) => {
    switch (area) {
      case 'synthesis': return 'Synthèse';
      case 'ideation': return 'Idéation';
      case 'risks': return 'Identification des risques';
      case 'proposals': return 'Propositions';
      default: return 'Non déterminé';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Style de Pensée</h4>
          <Badge variant="outline" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Privé
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {style?.optIn ? 'Activé' : 'Désactivé'}
          </span>
          <Switch
            checked={style?.optIn || false}
            onCheckedChange={toggleOptIn}
            disabled={loading}
          />
        </div>
      </div>

      {!style?.optIn ? (
        <div className="text-center py-6 text-muted-foreground">
          <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Analytics de pensée désactivées</p>
          <p className="text-xs mt-1">
            Activez pour recevoir des insights privés sur votre style de contribution
          </p>
        </div>
      ) : style.debatesParticipated < 3 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Pas encore assez de données</p>
          <p className="text-xs mt-1">
            Participez à {3 - style.debatesParticipated} débats supplémentaires pour obtenir vos insights
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Strongest Impact Area */}
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {getImpactIcon(style.strongestImpactArea)}
              <span className="text-sm font-medium">Votre force principale</span>
            </div>
            <p className="text-lg font-bold text-primary">
              {getImpactLabel(style.strongestImpactArea)}
            </p>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showDetails ? 'Masquer les détails' : 'Voir les détails'}
          </Button>

          {showDetails && (
            <div className="space-y-3 pt-3 border-t">
              {/* Early Agreement */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-blue-500" />
                    <span>Accord précoce</span>
                  </div>
                  <span className="text-muted-foreground">
                    {Math.round(style.earlyAgreementRate * 100)}%
                  </span>
                </div>
                <Progress value={style.earlyAgreementRate * 100} className="h-1.5" />
                {style.earlyAgreementRate > 0.7 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Vous avez tendance à être d'accord tôt. Essayez de challenger plus.
                  </p>
                )}
              </div>

              {/* Risk Raising */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Identification des risques</span>
                  </div>
                  <span className="text-muted-foreground">
                    {Math.round(style.riskRaisingRate * 100)}%
                  </span>
                </div>
                <Progress value={style.riskRaisingRate * 100} className="h-1.5" />
              </div>

              {/* Alternative Proposals */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-green-500" />
                    <span>Propositions alternatives</span>
                  </div>
                  <span className="text-muted-foreground">
                    {Math.round(style.alternativeProposalRate * 100)}%
                  </span>
                </div>
                <Progress value={style.alternativeProposalRate * 100} className="h-1.5" />
                {style.riskRaisingRate > 0.5 && style.alternativeProposalRate < 0.3 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Vous identifiez bien les risques mais proposez peu d'alternatives.
                  </p>
                )}
              </div>

              {/* Insights */}
              {style.insights.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Insights personnels
                  </p>
                  {style.insights.map((insight, i) => (
                    <p key={i} className="text-sm italic text-muted-foreground">
                      "{insight}"
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
