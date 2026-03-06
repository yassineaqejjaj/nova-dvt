import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ArrowRight, ArrowLeft, Clock, Users } from 'lucide-react';
import { Meeting, TeamMember, SprintConfig } from './types';
import { eachDayOfInterval, parseISO, isWeekend, format } from 'date-fns';

interface Props {
  meetings: Meeting[];
  members: TeamMember[];
  sprintConfig: SprintConfig;
  onChange: (meetings: Meeting[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRESETS: Partial<Meeting>[] = [
  { name: 'Daily Standup', durationMinutes: 15, frequency: 'daily', allParticipants: true },
  { name: 'Sprint Planning', durationMinutes: 120, frequency: 'once', allParticipants: true },
  { name: 'Refinement', durationMinutes: 60, frequency: 'weekly', allParticipants: true },
  { name: 'Sprint Review', durationMinutes: 60, frequency: 'once', allParticipants: true },
  { name: 'Rétrospective', durationMinutes: 60, frequency: 'once', allParticipants: true },
];

const FREQ_LABELS: Record<string, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  'bi-weekly': 'Bi-hebdomadaire',
  once: 'Une fois',
};

const StepMeetings: React.FC<Props> = ({ meetings, members, sprintConfig, onChange, onNext, onBack }) => {
  const [form, setForm] = useState<Partial<Meeting>>({ frequency: 'weekly', durationMinutes: 60, allParticipants: true, participantIds: [] });

  const workDays = (() => {
    if (!sprintConfig.startDate || !sprintConfig.endDate) return 0;
    try {
      return eachDayOfInterval({ start: parseISO(sprintConfig.startDate), end: parseISO(sprintConfig.endDate) })
        .filter(d => !isWeekend(d) && !sprintConfig.holidays.includes(format(d, 'yyyy-MM-dd'))).length;
    } catch { return 10; }
  })();

  const getOccurrences = (freq: string) => {
    switch (freq) {
      case 'daily': return workDays;
      case 'weekly': return Math.ceil(workDays / 5);
      case 'bi-weekly': return Math.ceil(workDays / 10);
      case 'once': return 1;
      default: return 1;
    }
  };

  const getTotalMeetingHours = () => {
    return meetings.reduce((sum, m) => {
      const occ = getOccurrences(m.frequency);
      const participants = m.allParticipants ? members.length : m.participantIds.length;
      return sum + (m.durationMinutes / 60) * occ * participants;
    }, 0);
  };

  const handleAdd = () => {
    if (!form.name) return;
    onChange([...meetings, { id: Date.now().toString(), participantIds: [], ...form } as Meeting]);
    setForm({ frequency: 'weekly', durationMinutes: 60, allParticipants: true, participantIds: [] });
  };

  const handlePreset = (preset: Partial<Meeting>) => {
    if (meetings.some(m => m.name === preset.name)) return;
    onChange([...meetings, { id: Date.now().toString(), participantIds: [], ...preset } as Meeting]);
  };

  const totalHours = getTotalMeetingHours();
  const totalDaysEquiv = totalHours / sprintConfig.hoursPerDay;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Cérémonies & Réunions</h3>
        <p className="text-sm text-muted-foreground">Le temps consommé par les réunions sera déduit de la capacité</p>
      </div>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Ajouter des cérémonies standard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => {
              const alreadyAdded = meetings.some(m => m.name === p.name);
              return (
                <Button key={p.name} variant={alreadyAdded ? "secondary" : "outline"} size="sm" onClick={() => handlePreset(p)} disabled={alreadyAdded}>
                  {alreadyAdded ? '✓ ' : '+ '}{p.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom add */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Ajouter une réunion personnalisée</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Nom</Label>
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Réunion client" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Durée (min)</Label>
              <Input type="number" min={15} step={15} value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fréquence</Label>
              <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v as Meeting['frequency'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQ_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="h-9" disabled={!form.name}>
              <Plus className="w-4 h-4 mr-1" /> Ajouter
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Checkbox
              checked={form.allParticipants}
              onCheckedChange={checked => setForm({ ...form, allParticipants: !!checked })}
            />
            <Label className="text-xs">Toute l'équipe participe</Label>
          </div>
        </CardContent>
      </Card>

      {/* Meetings list */}
      {meetings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Réunions configurées ({meetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {meetings.map(m => {
                const occ = getOccurrences(m.frequency);
                const participants = m.allParticipants ? members.length : m.participantIds.length;
                const hours = (m.durationMinutes / 60) * occ * participants;
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{m.name}</span>
                      <Badge variant="outline" className="text-xs">{m.durationMinutes}min</Badge>
                      <Badge variant="secondary" className="text-xs">{FREQ_LABELS[m.frequency]}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />{m.allParticipants ? 'Tous' : `${m.participantIds.length}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs">{hours.toFixed(1)}h total</Badge>
                      <Button variant="ghost" size="sm" onClick={() => onChange(meetings.filter(x => x.id !== m.id))}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impact summary */}
      <Card className="bg-accent/50 border-accent">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Impact total des réunions</p>
              <p className="text-lg font-bold">{totalHours.toFixed(1)}h personne</p>
              <p className="text-xs text-muted-foreground">≈ {totalDaysEquiv.toFixed(1)} jours-personne déduits</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
              <Button onClick={onNext}>Voir la capacité <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepMeetings;
