import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowRight, ArrowLeft, CalendarOff } from 'lucide-react';
import { Absence, TeamMember } from './types';
import { differenceInBusinessDays, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  absences: Absence[];
  members: TeamMember[];
  onChange: (absences: Absence[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ABSENCE_TYPES: { value: Absence['type']; label: string }[] = [
  { value: 'congés', label: 'Congés' },
  { value: 'RTT', label: 'RTT' },
  { value: 'formation', label: 'Formation' },
  { value: 'maladie', label: 'Maladie' },
  { value: 'autre', label: 'Autre' },
];

const StepAbsences: React.FC<Props> = ({ absences, members, onChange, onNext, onBack }) => {
  const [form, setForm] = useState<Partial<Absence>>({ type: 'congés' });

  const handleAdd = () => {
    if (!form.memberId || !form.startDate || !form.endDate) return;
    onChange([...absences, { id: Date.now().toString(), ...form } as Absence]);
    setForm({ type: 'congés' });
  };

  const getAbsenceDays = (a: Absence) => {
    try {
      return differenceInBusinessDays(parseISO(a.endDate), parseISO(a.startDate)) + 1;
    } catch { return 0; }
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || id;

  const totalAbsenceDays = absences.reduce((sum, a) => sum + getAbsenceDays(a), 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Absences de l'équipe</h3>
        <p className="text-sm text-muted-foreground">Déclarez les indisponibilités pour chaque membre</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Ajouter une absence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Membre</Label>
              <Select value={form.memberId} onValueChange={v => setForm({ ...form, memberId: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as Absence['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ABSENCE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Du</Label>
              <Input type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Au</Label>
              <Input type="date" value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <Button onClick={handleAdd} className="h-9" disabled={!form.memberId || !form.startDate || !form.endDate}>
              <Plus className="w-4 h-4 mr-1" /> Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {absences.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarOff className="w-4 h-4" />
              Absences déclarées ({absences.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {absences.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">{a.type}</Badge>
                    <span className="text-sm font-medium">{getMemberName(a.memberId)}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(a.startDate), 'dd MMM', { locale: fr })} → {format(parseISO(a.endDate), 'dd MMM', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{getAbsenceDays(a)}j</Badge>
                    <Button variant="ghost" size="sm" onClick={() => onChange(absences.filter(x => x.id !== a.id))}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <CalendarOff className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucune absence déclarée — capacité à 100%</p>
          </CardContent>
        </Card>
      )}

      {totalAbsenceDays > 0 && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-4">
            <p className="text-sm"><span className="font-medium text-destructive">{totalAbsenceDays} jour{totalAbsenceDays > 1 ? 's' : ''}</span> d'absence au total seront déduits de la capacité</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
        <Button onClick={onNext}>Suivant <ArrowRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );
};

export default StepAbsences;
