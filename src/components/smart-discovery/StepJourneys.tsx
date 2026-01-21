import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Users, 
  MapPin, 
  Heart, 
  AlertTriangle,
  Plus, 
  X,
  ArrowRight,
  Check
} from 'lucide-react';
import { Persona, JourneyNeed } from './types';

interface StepJourneysProps {
  personas: Persona[];
  journeyNeeds: JourneyNeed[];
  onUpdate: (journeys: JourneyNeed[]) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const StepJourneys = ({
  personas,
  journeyNeeds,
  onUpdate,
  onNext,
  onBack,
  isLoading
}: StepJourneysProps) => {
  const selectedPersonas = personas.filter(p => p.selected);
  const [newItems, setNewItems] = useState<Record<string, { situation: string; need: string; friction: string }>>({});

  const getJourneyForPersona = (personaId: string) => {
    return journeyNeeds.find(j => j.personaId === personaId) || {
      id: crypto.randomUUID(),
      personaId,
      situations: [],
      needs: [],
      frictionPoints: []
    };
  };

  const updateJourney = (personaId: string, field: 'situations' | 'needs' | 'frictionPoints', value: string[]) => {
    const existing = journeyNeeds.find(j => j.personaId === personaId);
    if (existing) {
      onUpdate(journeyNeeds.map(j => 
        j.personaId === personaId ? { ...j, [field]: value } : j
      ));
    } else {
      onUpdate([
        ...journeyNeeds,
        {
          id: crypto.randomUUID(),
          personaId,
          situations: field === 'situations' ? value : [],
          needs: field === 'needs' ? value : [],
          frictionPoints: field === 'frictionPoints' ? value : []
        }
      ]);
    }
  };

  const handleAddItem = (personaId: string, field: 'situations' | 'needs' | 'frictionPoints') => {
    const key = field === 'situations' ? 'situation' : field === 'needs' ? 'need' : 'friction';
    const itemValue = newItems[personaId]?.[key] || '';
    
    if (itemValue.trim()) {
      const journey = getJourneyForPersona(personaId);
      updateJourney(personaId, field, [...journey[field], itemValue.trim()]);
      setNewItems({
        ...newItems,
        [personaId]: { ...newItems[personaId], [key]: '' }
      });
    }
  };

  const handleRemoveItem = (personaId: string, field: 'situations' | 'needs' | 'frictionPoints', index: number) => {
    const journey = getJourneyForPersona(personaId);
    updateJourney(personaId, field, journey[field].filter((_, i) => i !== index));
  };

  const handleEditItem = (personaId: string, field: 'situations' | 'needs' | 'frictionPoints', index: number, value: string) => {
    const journey = getJourneyForPersona(personaId);
    updateJourney(personaId, field, journey[field].map((item, i) => i === index ? value : item));
  };

  const allPersonasHaveData = selectedPersonas.every(persona => {
    const journey = getJourneyForPersona(persona.id);
    return journey.situations.length > 0 || journey.needs.length > 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div>
            <h3 className="font-semibold">Parcours et besoins</h3>
            <p className="text-sm text-muted-foreground">
              Pour chaque persona sélectionné, définissez les situations clés, besoins et points de friction
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Journeys by Persona */}
      <Accordion type="multiple" defaultValue={selectedPersonas.map(p => p.id)} className="space-y-4">
        {selectedPersonas.map((persona) => {
          const journey = getJourneyForPersona(persona.id);
          const personaNewItems = newItems[persona.id] || { situation: '', need: '', friction: '' };
          
          return (
            <AccordionItem key={persona.id} value={persona.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{persona.role}</span>
                  <Badge variant="secondary" className="text-xs">
                    {journey.situations.length + journey.needs.length + journey.frictionPoints.length} éléments
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                {/* Situations */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Situations clés
                  </h4>
                  <div className="space-y-2 ml-6">
                    {journey.situations.map((situation, index) => (
                      <div key={index} className="flex items-center gap-2 group">
                        <Input
                          value={situation}
                          onChange={(e) => handleEditItem(persona.id, 'situations', index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveItem(persona.id, 'situations', index)}
                          className="opacity-0 group-hover:opacity-100 text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter une situation..."
                        value={personaNewItems.situation}
                        onChange={(e) => setNewItems({
                          ...newItems,
                          [persona.id]: { ...personaNewItems, situation: e.target.value }
                        })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(persona.id, 'situations')}
                      />
                      <Button size="icon" variant="outline" onClick={() => handleAddItem(persona.id, 'situations')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Needs */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-green-500" />
                    Besoins associés
                  </h4>
                  <div className="space-y-2 ml-6">
                    {journey.needs.map((need, index) => (
                      <div key={index} className="flex items-center gap-2 group">
                        <Input
                          value={need}
                          onChange={(e) => handleEditItem(persona.id, 'needs', index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveItem(persona.id, 'needs', index)}
                          className="opacity-0 group-hover:opacity-100 text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter un besoin..."
                        value={personaNewItems.need}
                        onChange={(e) => setNewItems({
                          ...newItems,
                          [persona.id]: { ...personaNewItems, need: e.target.value }
                        })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(persona.id, 'needs')}
                      />
                      <Button size="icon" variant="outline" onClick={() => handleAddItem(persona.id, 'needs')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Friction Points */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Points de friction
                  </h4>
                  <div className="space-y-2 ml-6">
                    {journey.frictionPoints.map((friction, index) => (
                      <div key={index} className="flex items-center gap-2 group">
                        <Input
                          value={friction}
                          onChange={(e) => handleEditItem(persona.id, 'frictionPoints', index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveItem(persona.id, 'frictionPoints', index)}
                          className="opacity-0 group-hover:opacity-100 text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter un point de friction..."
                        value={personaNewItems.friction}
                        onChange={(e) => setNewItems({
                          ...newItems,
                          [persona.id]: { ...personaNewItems, friction: e.target.value }
                        })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(persona.id, 'frictionPoints')}
                      />
                      <Button size="icon" variant="outline" onClick={() => handleAddItem(persona.id, 'frictionPoints')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onNext} disabled={isLoading}>
          Valider et générer les Epics
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
