import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/AuthDialog';
import { Sparkles, Brain, Target, BarChart3, Zap, Shield, Users, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');

  const openSignIn = () => {
    setAuthTab('signin');
    setShowAuth(true);
  };

  const openSignUp = () => {
    setAuthTab('signup');
    setShowAuth(true);
  };

  const features = [
    {
      icon: Brain,
      title: 'Sprint Intelligence',
      description: 'Calculez la capacité réelle de votre équipe et planifiez des sprints réalistes.',
    },
    {
      icon: Target,
      title: 'Impact Analysis',
      description: 'Mesurez l\'impact de chaque changement sur votre produit en temps réel.',
    },
    {
      icon: Sparkles,
      title: 'Smart Discovery',
      description: 'Passez d\'une idée à des user stories prêtes pour le développement.',
    },
    {
      icon: BarChart3,
      title: 'Instant PRD',
      description: 'Générez des documents produit structurés en quelques minutes.',
    },
    {
      icon: Users,
      title: 'Squads IA',
      description: 'Assemblez des équipes d\'agents IA spécialisés pour vos projets.',
    },
    {
      icon: Shield,
      title: 'Reality Mode',
      description: 'Challengez vos décisions avec des agents aux perspectives variées.',
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <img
                  src="/lovable-uploads/420dfc65-a110-4707-9eb4-3ffc08d33dd3.png"
                  alt="Nova"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-bold gradient-text">Nova</span>
                <span className="text-xs text-muted-foreground ml-2">by Devoteam</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={openSignIn}>
                Sign in
              </Button>
              <Button onClick={openSignUp}>
                Sign up
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container mx-auto px-6 py-24 md:py-32 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-primary" />
                L'IA au service des Product Managers
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Nova — L'environnement de travail{' '}
                <span className="gradient-text">augmenté par l'IA</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Planifiez vos sprints, analysez l'impact de vos décisions et générez vos artefacts produit
                avec des agents IA spécialisés. Pensez moins à l'outil, concentrez-vous sur votre produit.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" onClick={openSignUp} className="text-base px-8">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={openSignIn} className="text-base px-8">
                  Se connecter
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/40 bg-muted/20">
          <div className="container mx-auto px-6 py-20 md:py-28">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Tout ce dont un PM a besoin, au même endroit
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Des outils structurants intégrés dans vos workflows quotidiens.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 space-y-3 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40">
          <div className="container mx-auto px-6 py-20 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Prêt à augmenter votre productivité ?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Rejoignez Nova et transformez votre façon de piloter vos produits.
            </p>
            <Button size="lg" onClick={openSignUp} className="text-base px-8">
              Créer un compte
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-muted/10">
          <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/devoteam-logo.png"
                alt="Devoteam"
                className="h-6 object-contain opacity-60"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Nova by Devoteam. Tous droits réservés.
            </p>
          </div>
        </footer>
      </div>

      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
    </>
  );
};

export default Landing;
