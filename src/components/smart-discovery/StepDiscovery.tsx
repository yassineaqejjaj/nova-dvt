import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Lightbulb, 
  AlertTriangle, 
  BarChart3, 
  Edit3, 
  Plus, 
  X, 
  Check,
  ArrowRight
} from 'lucide-react';
import { DiscoveryData } from './types';

interface StepDiscoveryProps {
  reformulatedProblem: string;
  discoveryData: DiscoveryData;
  onUpdate: (data: DiscoveryData, problem: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const StepDiscovery = ({
  reformulatedProblem,
  discoveryData,
  onUpdate,
  onNext,
  onBack,
  isLoading
}: StepDiscoveryProps) => {
  const [editingProblem, setEditingProblem] = useState(false);
  const [tempProblem, setTempProblem] = useState(reformulatedProblem);
  const [newItems, setNewItems] = useState({
    hypothesis: '',
    objective: '',
    constraint: '',
    indicator: ''
  });

  const handleSaveProblem = () => {
    onUpdate(discoveryData, tempProblem);
    setEditingProblem(false);
  };

  const handleAddItem = (type: 'hypotheses' | 'objectives' | 'constraints' | 'indicators') => {
    const key = type === 'hypotheses' ? 'hypothesis' : 
                type === 'objectives' ? 'objective' : 
                type === 'constraints' ? 'constraint' : 'indicator';
    
    if (newItems[key].trim()) {
      onUpdate({
        ...discoveryData,
        [type]: [...discoveryData[type], newItems[key].trim()]
      }, reformulatedProblem);
      setNewItems({ ...newItems, [key]: '' });
    }
  };

  const handleRemoveItem = (type: 'hypotheses' | 'objectives' | 'constraints' | 'indicators', index: number) => {
    onUpdate({
      ...discoveryData,
      [type]: discoveryData[type].filter((_, i) => i !== index)
    }, reformulatedProblem);
  };

  const handleEditItem = (type: 'hypotheses' | 'objectives' | 'constraints' | 'indicators', index: number, value: string) => {
    onUpdate({
      ...discoveryData,
      [type]: discoveryData[type].map((item, i) => i === index ? value : item)
    }, reformulatedProblem);
  };

  return (
    <div className="space-y-6">
      {/* Reformulated Problem */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Problème métier reformulé
          </CardTitle>
          <CardDescription>
            Validez ou corrigez la reformulation avant de continuer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editingProblem ? (
            <div className="space-y-3">
              <Textarea
                value={tempProblem}
                onChange={(e) => setTempProblem(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveProblem}>
                  <Check className="mr-1 h-4 w-4" />
                  Valider
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setTempProblem(reformulatedProblem);
                  setEditingProblem(false);
                }}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p className="text-lg font-medium">{reformulatedProblem}</p>
              <Button size="sm" variant="ghost" onClick={() => setEditingProblem(true)}>
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hypotheses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Hypothèses principales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {discoveryData.hypotheses.map((hypothesis, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <Input
                value={hypothesis}
                onChange={(e) => handleEditItem('hypotheses', index, e.target.value)}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveItem('hypotheses', index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter une hypothèse..."
              value={newItems.hypothesis}
              onChange={(e) => setNewItems({ ...newItems, hypothesis: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem('hypotheses')}
            />
            <Button size="icon" variant="outline" onClick={() => handleAddItem('hypotheses')}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objectifs recherchés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {discoveryData.objectives.map((objective, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <Input
                value={objective}
                onChange={(e) => handleEditItem('objectives', index, e.target.value)}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveItem('objectives', index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un objectif..."
              value={newItems.objective}
              onChange={(e) => setNewItems({ ...newItems, objective: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem('objectives')}
            />
            <Button size="icon" variant="outline" onClick={() => handleAddItem('objectives')}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Constraints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Contraintes connues (tech, data, orga)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {discoveryData.constraints.map((constraint, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <Input
                value={constraint}
                onChange={(e) => handleEditItem('constraints', index, e.target.value)}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveItem('constraints', index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter une contrainte..."
              value={newItems.constraint}
              onChange={(e) => setNewItems({ ...newItems, constraint: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem('constraints')}
            />
            <Button size="icon" variant="outline" onClick={() => handleAddItem('constraints')}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Indicateurs pressentis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {discoveryData.indicators.map((indicator, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <Input
                value={indicator}
                onChange={(e) => handleEditItem('indicators', index, e.target.value)}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveItem('indicators', index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un indicateur..."
              value={newItems.indicator}
              onChange={(e) => setNewItems({ ...newItems, indicator: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem('indicators')}
            />
            <Button size="icon" variant="outline" onClick={() => handleAddItem('indicators')}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onNext} disabled={isLoading}>
          Valider et passer aux Personas
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
