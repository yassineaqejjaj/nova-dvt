import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, ArrowRight, ArrowLeft, Edit2 } from 'lucide-react';
import { TeamMember } from './types';
import { toast } from 'sonner';

interface Props {
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ROLES = ['Backend dev', 'Frontend dev', 'Fullstack dev', 'Data scientist', 'QA', 'Designer', 'DevOps', 'Tech Lead', 'Autre'];

const StepTeamSetup: React.FC<Props> = ({ members, onChange, onNext, onBack }) => {
  const [form, setForm] = useState<Partial<TeamMember>>({ role: 'Backend dev', pointsPerDay: 1, contributionRate: 1 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!form.name) { toast.error('Nom requis'); return; }
    if (editingId) {
      onChange(members.map(m => m.id === editingId ? { ...m, ...form } as TeamMember : m));
      setEditingId(null);
    } else {
      onChange([...members, { id: Date.now().toString(), ...form } as TeamMember]);
    }
    setForm({ role: 'Backend dev', pointsPerDay: 1, contributionRate: 1 });
  };

  const handleEdit = (m: TeamMember) => {
    setForm(m);
    setEditingId(m.id);
  };

  const handleDelete = (id: string) => {
    onChange(members.filter(m => m.id !== id));
    if (editingId === id) { setEditingId(null); setForm({ role: 'Backend dev', pointsPerDay: 1, contributionRate: 1 }); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Composition de l'équipe</h3>
        <p className="text-sm text-muted-foreground">Ajoutez les membres et leur productivité individuelle</p>
      </div>

      {/* Add form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{editingId ? 'Modifier le membre' : 'Ajouter un membre'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Nom</Label>
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alice" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rôle</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Points / jour</Label>
              <Input type="number" step="0.1" min="0.1" max="5" value={form.pointsPerDay} onChange={e => setForm({ ...form, pointsPerDay: parseFloat(e.target.value) || 1 })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contribution (%)</Label>
              <Input type="number" min="10" max="100" step="10" value={(form.contributionRate || 1) * 100} onChange={e => setForm({ ...form, contributionRate: (parseInt(e.target.value) || 100) / 100 })} />
            </div>
            <Button onClick={handleAdd} className="h-9">
              <Plus className="w-4 h-4 mr-1" />
              {editingId ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team list */}
      {members.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Équipe ({members.length} membre{members.length > 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">{m.pointsPerDay} pts/j</Badge>
                    <Badge variant="secondary" className="text-xs">{Math.round(m.contributionRate * 100)}%</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(m)}><Edit2 className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
        <Button onClick={onNext} disabled={members.length === 0}>
          Suivant <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepTeamSetup;
