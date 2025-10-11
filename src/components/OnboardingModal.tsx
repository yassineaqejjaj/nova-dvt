import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Palette, Code, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingModalProps {
  open: boolean;
  userId: string;
  onComplete: () => void;
}

type UserRole = 'PM' | 'Designer' | 'Dev';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'PM',
    title: 'Product Manager',
    description: 'Priorisation, KPIs, roadmap et stratégie produit',
    icon: <User className="w-6 h-6" />,
    color: 'from-agent-blue to-agent-blue-light'
  },
  {
    id: 'Designer',
    title: 'Designer',
    description: 'Recherche utilisateur, UX/UI et insights',
    icon: <Palette className="w-6 h-6" />,
    color: 'from-agent-purple to-agent-purple-light'
  },
  {
    id: 'Dev',
    title: 'Developer',
    description: 'Architecture technique, tests et implémentation',
    icon: <Code className="w-6 h-6" />,
    color: 'from-agent-green to-agent-green-light'
  }
];

export function OnboardingModal({ open, userId, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<'welcome' | 'role' | 'context' | 'sample'>('welcome');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [contextName, setContextName] = useState('');
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadSampleData, setLoadSampleData] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('context');
  };

  const handleContextCreation = async () => {
    if (!contextName.trim()) {
      toast.error('Veuillez donner un nom à votre contexte');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with role
      await supabase
        .from('profiles')
        .update({
          display_name: displayName || 'Utilisateur Nova',
          role: roleOptions.find(r => r.id === selectedRole)?.title || 'Team Member'
        })
        .eq('user_id', userId);

      // Create first context
      await supabase
        .from('product_contexts')
        .insert({
          user_id: userId,
          name: contextName,
          vision: vision || null,
          is_active: true
        });

      // Create default squad
      await supabase
        .from('squads')
        .insert({
          user_id: userId,
          name: 'Mon Premier Squad',
          purpose: 'Squad de démarrage pour explorer Nova'
        });

      // If sample data requested, create sample artifacts
      if (loadSampleData) {
        await createSampleData();
      }

      toast.success('Bienvenue sur Nova ! 🚀');
      onComplete();
    } catch (error) {
      console.error('Error during onboarding:', error);
      toast.error('Erreur lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    try {
      // Create sample Epic
      await supabase.from('artifacts').insert({
        user_id: userId,
        artifact_type: 'epic',
        title: '🎯 Epic Exemple - Système de Notifications',
        content: {
          description: 'Implémenter un système de notifications en temps réel',
          stories: [
            {
              title: 'Notifications in-app',
              description: 'Afficher les notifications dans l\'interface',
              acceptanceCriteria: ['Badge avec compteur', 'Liste des notifications', 'Marquage lu/non lu']
            }
          ],
          kpis: [
            { name: 'Taux d\'engagement', target: '40%', frequency: 'Hebdomadaire' }
          ]
        }
      });

      // Create sample KPI set
      await supabase.from('artifacts').insert({
        user_id: userId,
        artifact_type: 'canvas',
        title: '📊 KPIs Exemple - Acquisition',
        content: {
          kpis: [
            { name: 'Taux de conversion', formula: '(inscriptions / visiteurs) * 100', target: '5%' },
            { name: 'CAC', formula: 'coûts marketing / nouveaux clients', target: '50€' }
          ]
        }
      });
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  };

  const renderWelcome = () => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-3xl font-bold gradient-text flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Bienvenue sur N.O.V.A.
        </DialogTitle>
        <DialogDescription className="text-base mt-4">
          Votre Operating System pour équipes Produit, unifiant structure, méthodologie et IA.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-agent-blue to-agent-blue-light mx-auto mb-3 flex items-center justify-center text-white font-bold">
                1
              </div>
              <h4 className="font-semibold mb-1">NOVA CORE</h4>
              <p className="text-xs text-muted-foreground">Fondations & Artefacts</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-agent-purple to-agent-purple-light mx-auto mb-3 flex items-center justify-center text-white font-bold">
                2
              </div>
              <h4 className="font-semibold mb-1">NOVA WORKFLOWS</h4>
              <p className="text-xs text-muted-foreground">Processus IA-guidés</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-agent-orange to-agent-orange-light mx-auto mb-3 flex items-center justify-center text-white font-bold">
                3
              </div>
              <h4 className="font-semibold mb-1">NOVA AGENT</h4>
              <p className="text-xs text-muted-foreground">Assistant IA adaptatif</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-center">
            Commençons par configurer votre profil et créer votre premier contexte produit.
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="displayName">Votre nom (optionnel)</Label>
          <Input
            id="displayName"
            placeholder="Ex: Marie Dupont"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <Button
          onClick={() => setStep('role')}
          className="w-full"
          size="lg"
        >
          Commencer
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </DialogContent>
  );

  const renderRoleSelection = () => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Quel est votre rôle ?</DialogTitle>
        <DialogDescription>
          Choisissez votre rôle pour personnaliser votre expérience Nova
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
        {roleOptions.map((role) => (
          <Card
            key={role.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
            onClick={() => handleRoleSelect(role.id)}
          >
            <CardContent className="pt-6">
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${role.color} mx-auto mb-4 flex items-center justify-center text-white`}>
                {role.icon}
              </div>
              <h3 className="font-semibold text-center mb-2">{role.title}</h3>
              <p className="text-xs text-muted-foreground text-center">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="ghost" onClick={() => setStep('welcome')} className="w-full">
        Retour
      </Button>
    </DialogContent>
  );

  const renderContextCreation = () => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Créez votre premier contexte</DialogTitle>
        <DialogDescription>
          Le contexte produit centralise votre vision, objectifs et KPIs pour tous les workflows
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="bg-gradient-to-br from-primary/5 to-agent-blue/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">Rôle sélectionné</p>
              <Badge variant="secondary" className="text-xs">
                {roleOptions.find(r => r.id === selectedRole)?.title}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="contextName">Nom du contexte *</Label>
          <Input
            id="contextName"
            placeholder="Ex: Application Mobile Fitness"
            value={contextName}
            onChange={(e) => setContextName(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="vision">Vision produit (optionnel)</Label>
          <Textarea
            id="vision"
            placeholder="Ex: Créer l'application de fitness la plus personnalisée du marché..."
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            rows={3}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="sampleData"
              checked={loadSampleData}
              onChange={(e) => setLoadSampleData(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="sampleData" className="text-sm cursor-pointer">
              <span className="font-semibold">Charger des données d'exemple</span>
              <p className="text-muted-foreground mt-1">
                Inclut un Epic et des KPIs exemples pour explorer Nova
              </p>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('role')} className="flex-1">
            Retour
          </Button>
          <Button
            onClick={handleContextCreation}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Configuration...
              </>
            ) : (
              <>
                Terminer
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      {step === 'welcome' && renderWelcome()}
      {step === 'role' && renderRoleSelection()}
      {step === 'context' && renderContextCreation()}
    </Dialog>
  );
}
