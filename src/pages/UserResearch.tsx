import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPersonaBuilder } from '@/components/UserPersonaBuilder';
import { MarketResearch } from '@/components/MarketResearch';
import { Users, Search, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const UserResearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personas');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
                <Search className="w-8 h-8" />
                Recherche Utilisateur & Insights
              </h1>
              <p className="text-muted-foreground mt-2">
                Découvrez vos utilisateurs, analysez le marché et générez des insights actionnables
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3" />
            IA
          </Badge>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personas" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Personas Utilisateur
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Étude de Marché
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Générateur de Personas</CardTitle>
              <CardDescription>
                Créez des personas utilisateur détaillés basés sur l'IA pour mieux comprendre votre audience cible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserPersonaBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Étude de Marché IA</CardTitle>
              <CardDescription>
                Collectez de l'intelligence concurrentielle et des insights marché avec une recherche web propulsée par IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketResearch />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
};
