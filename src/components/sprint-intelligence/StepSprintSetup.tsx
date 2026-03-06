import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, X, ArrowRight } from 'lucide-react';
import { SprintConfig } from './types';
import { differenceInBusinessDays, format, parseISO, isWeekend, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  config: SprintConfig;
  onChange: (config: SprintConfig) => void;
  onNext: () => void;
}

const StepSprintSetup: React.FC<Props> = ({ config, onChange, onNext }) => {
  const [holidayInput, setHolidayInput] = useState('');

  const workDays = (() => {
    if (!config.startDate || !config.endDate) return 0;
    try {
      const days = eachDayOfInterval({ start: parseISO(config.startDate), end: parseISO(config.endDate) });
      return days.filter(d => !isWeekend(d) && !config.holidays.includes(format(d, 'yyyy-MM-dd'))).length;
    } catch { return 0; }
  })();

  const addHoliday = () => {
    if (holidayInput && !config.holidays.includes(holidayInput)) {
      onChange({ ...config, holidays: [...config.holidays, holidayInput] });
      setHolidayInput('');
    }
  };

  const removeHoliday = (h: string) => {
    onChange({ ...config, holidays: config.holidays.filter(d => d !== h) });
  };

  const isValid = config.name && config.startDate && config.endDate && workDays > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Configuration du Sprint</h3>
        <p className="text-sm text-muted-foreground">Définissez les dates et paramètres de votre sprint</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Informations Sprint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du sprint</Label>
              <Input
                value={config.name}
                onChange={e => onChange({ ...config, name: e.target.value })}
                placeholder="Sprint 12"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={config.startDate}
                  onChange={e => onChange({ ...config, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={config.endDate}
                  onChange={e => onChange({ ...config, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Heures de travail / jour</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={config.hoursPerDay}
                onChange={e => onChange({ ...config, hoursPerDay: parseFloat(e.target.value) || 7 })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Jours fériés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="date"
                value={holidayInput}
                onChange={e => setHolidayInput(e.target.value)}
              />
              <Button size="sm" variant="outline" onClick={addHoliday}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.holidays.map(h => (
                <Badge key={h} variant="secondary" className="gap-1">
                  {format(parseISO(h), 'dd MMM', { locale: fr })}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeHoliday(h)} />
                </Badge>
              ))}
              {config.holidays.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucun jour férié ajouté</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Jours ouvrés du sprint</p>
                <p className="text-2xl font-bold text-primary">{workDays} jours</p>
              </div>
              {config.holidays.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  ({config.holidays.length} jour{config.holidays.length > 1 ? 's' : ''} férié{config.holidays.length > 1 ? 's' : ''} déduit{config.holidays.length > 1 ? 's' : ''})
                </div>
              )}
            </div>
            <Button onClick={onNext} disabled={!isValid}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepSprintSetup;
