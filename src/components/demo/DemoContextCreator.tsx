import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Sparkles, Target, Users, BarChart3, ArrowRight } from 'lucide-react';

interface DemoContextCreatorProps {
  onContextCreated: (context: DemoProductContext) => void;
}

export interface DemoProductContext {
  name: string;
  vision: string;
  audience: string;
  objective: string;
}

const TEMPLATES = [
  {
    label: 'App Mobile SaaS',
    name: 'App Mobile Fitness',
    vision: 'Créer une application de fitness personnalisée par IA qui s\'adapte au niveau et aux objectifs de chaque utilisateur.',
    audience: 'Adultes 25-45 ans, urbains, intéressés par le bien-être et la santé',
    objective: 'Atteindre 10 000 utilisateurs actifs mensuels en 6 mois',
  },
  {
    label: 'Plateforme B2B',
    name: 'Portail Client B2B',
    vision: 'Centraliser la gestion des commandes, factures et support client dans un portail unifié.',
    audience: 'PME et ETI du secteur industriel, responsables achats et DAF',
    objective: 'Réduire de 40% les appels au support client',
  },
  {
    label: 'Marketplace',
    name: 'Marketplace Artisans',
    vision: 'Connecter les artisans locaux avec des consommateurs en quête de produits authentiques et durables.',
    audience: 'Consommateurs responsables, 28-50 ans, CSP+',
    objective: 'Référencer 500 artisans et générer 1 000 commandes/mois en 1 an',
  },
];

const DemoContextCreator: React.FC<DemoContextCreatorProps> = ({ onContextCreated }) => {
  const [mode, setMode] = useState<'choose' | 'form'>('choose');
  const [name, setName] = useState('');
  const [vision, setVision] = useState('');
  const [audience, setAudience] = useState('');
  const [objective, setObjective] = useState('');

  const handleTemplate = (tpl: typeof TEMPLATES[0]) => {
    onContextCreated({
      name: tpl.name,
      vision: tpl.vision,
      audience: tpl.audience,
      objective: tpl.objective,
    });
  };

  const handleCustomSubmit = () => {
    if (!name.trim()) return;
    onContextCreated({ name, vision, audience, objective });
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center" style={{ background: '#F8485E10' }}>
            <Target className="w-7 h-7" style={{ color: '#F8485E' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#141413' }}>
            Définissez votre contexte produit
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Le contexte est la base de tout dans Nova. Il alimente les agents, les workflows et les décisions générées.
          </p>
        </div>

        {mode === 'choose' ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-center mb-6" style={{ color: '#3C3C3A' }}>
              Choisissez un template ou créez le vôtre
            </p>
            <div className="grid gap-3">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  onClick={() => handleTemplate(tpl)}
                  className="w-full text-left p-5 border border-border hover:border-[#F8485E]/40 hover:bg-[#F8485E]/5 transition-all group"
                  style={{ borderRadius: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4" style={{ color: '#F8485E' }} />
                        <span className="font-bold text-sm">{tpl.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{tpl.name} — {tpl.audience.split(',')[0]}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#F8485E] transition-colors" />
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setMode('form')}
                className="text-sm font-semibold"
                style={{ borderRadius: 50 }}
              >
                Créer un contexte personnalisé
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div>
              <label className="text-sm font-semibold mb-1.5 flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: '#F8485E' }} />
                Nom du produit
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Mon App Mobile"
                style={{ borderRadius: 0 }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: '#F8485E' }} />
                Vision / Description
              </label>
              <Textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Quelle est la vision de votre produit ?"
                rows={3}
                style={{ borderRadius: 0 }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: '#F8485E' }} />
                Audience cible
              </label>
              <Input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Ex : PME, développeurs, étudiants..."
                style={{ borderRadius: 0 }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: '#F8485E' }} />
                Objectif principal
              </label>
              <Input
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Ex : 10 000 utilisateurs en 6 mois"
                style={{ borderRadius: 0 }}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setMode('choose')}
                style={{ borderRadius: 50 }}
              >
                Retour
              </Button>
              <Button
                onClick={handleCustomSubmit}
                disabled={!name.trim()}
                className="flex-1 text-white font-semibold"
                style={{ background: '#F8485E', borderRadius: 50 }}
              >
                Créer le contexte <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DemoContextCreator;
