import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, TrendingUp, Users, Calendar, Clock, AlertTriangle, CheckCircle, Zap, Plus, Trash2 } from 'lucide-react';
import { SprintConfig, TeamMember, Absence, Meeting, CapacityResult, MemberCapacity, VelocityEntry } from './types';
import { eachDayOfInterval, parseISO, isWeekend, format, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Props {
  sprintConfig: SprintConfig;
  members: TeamMember[];
  absences: Absence[];
  meetings: Meeting[];
  onBack: () => void;
}

const StepCapacityResult: React.FC<Props> = ({ sprintConfig, members, absences, meetings, onBack }) => {
  const [velocityHistory, setVelocityHistory] = useState<VelocityEntry[]>([
    { sprintName: 'Sprint 9', committed: 28, completed: 24 },
    { sprintName: 'Sprint 10', committed: 26, completed: 25 },
    { sprintName: 'Sprint 11', committed: 30, completed: 22 },
  ]);
  const [newVelocity, setNewVelocity] = useState<Partial<VelocityEntry>>({});

  const capacity = useMemo<CapacityResult>(() => {
    if (!sprintConfig.startDate || !sprintConfig.endDate) {
      return { members: [], totalPoints: 0, totalWorkDays: 0, totalMeetingHours: 0, productivePercent: 0, prudentPoints: 0, normalPoints: 0, aggressivePoints: 0 };
    }

    const sprintDays = eachDayOfInterval({ start: parseISO(sprintConfig.startDate), end: parseISO(sprintConfig.endDate) });
    const workDays = sprintDays.filter(d => !isWeekend(d) && !sprintConfig.holidays.includes(format(d, 'yyyy-MM-dd')));
    const totalWorkDays = workDays.length;

    // Calculate occurrences for meetings
    const getOcc = (freq: string) => {
      switch (freq) {
        case 'daily': return totalWorkDays;
        case 'weekly': return Math.ceil(totalWorkDays / 5);
        case 'bi-weekly': return Math.ceil(totalWorkDays / 10);
        case 'once': return 1;
        default: return 1;
      }
    };

    let totalMeetingHours = 0;

    const memberCapacities: MemberCapacity[] = members.map(member => {
      // Absence days for this member
      const memberAbsences = absences.filter(a => a.memberId === member.id);
      let absenceDays = 0;
      memberAbsences.forEach(a => {
        const aStart = parseISO(a.startDate);
        const aEnd = parseISO(a.endDate);
        absenceDays += workDays.filter(d => {
          try { return isWithinInterval(d, { start: aStart, end: aEnd }); } catch { return false; }
        }).length;
      });

      // Meeting hours for this member
      let memberMeetingHours = 0;
      meetings.forEach(m => {
        if (m.allParticipants || m.participantIds.includes(member.id)) {
          memberMeetingHours += (m.durationMinutes / 60) * getOcc(m.frequency);
        }
      });
      const meetingDays = memberMeetingHours / sprintConfig.hoursPerDay;
      totalMeetingHours += memberMeetingHours;

      const availableDays = Math.max(0, (totalWorkDays - absenceDays - meetingDays) * member.contributionRate);
      const points = availableDays * member.pointsPerDay;

      return {
        memberId: member.id,
        memberName: member.name,
        role: member.role,
        totalWorkDays,
        absenceDays,
        meetingDays: Math.round(meetingDays * 10) / 10,
        availableDays: Math.round(availableDays * 10) / 10,
        points: Math.round(points * 10) / 10,
        contributionRate: member.contributionRate,
      };
    });

    const totalPoints = memberCapacities.reduce((s, m) => s + m.points, 0);
    const maxCapacity = totalWorkDays * members.length;
    const productivePercent = maxCapacity > 0 ? (memberCapacities.reduce((s, m) => s + m.availableDays, 0) / maxCapacity) * 100 : 0;

    return {
      members: memberCapacities,
      totalPoints: Math.round(totalPoints * 10) / 10,
      totalWorkDays,
      totalMeetingHours: Math.round(totalMeetingHours * 10) / 10,
      productivePercent: Math.round(productivePercent),
      prudentPoints: Math.floor(totalPoints * 0.85),
      normalPoints: Math.round(totalPoints),
      aggressivePoints: Math.ceil(totalPoints * 1.05),
    };
  }, [sprintConfig, members, absences, meetings]);

  // Velocity stats
  const avgVelocity = velocityHistory.length > 0 ? Math.round(velocityHistory.reduce((s, v) => s + v.completed, 0) / velocityHistory.length * 10) / 10 : 0;
  const avgCommitment = velocityHistory.length > 0 ? Math.round(velocityHistory.reduce((s, v) => s + (v.completed / v.committed * 100), 0) / velocityHistory.length) : 0;

  // Alerts
  const alerts: { type: 'warning' | 'info'; message: string }[] = [];
  if (capacity.productivePercent < 60) alerts.push({ type: 'warning', message: 'Le temps productif est inférieur à 60%. Trop de réunions ?' });
  if (capacity.totalPoints > avgVelocity * 1.2 && avgVelocity > 0) alerts.push({ type: 'warning', message: `La capacité calculée (${capacity.totalPoints}) dépasse la vélocité moyenne (${avgVelocity}) de plus de 20%` });
  capacity.members.forEach(m => {
    if (m.availableDays < 3) alerts.push({ type: 'info', message: `${m.memberName} n'a que ${m.availableDays}j disponibles` });
  });

  const addVelocityEntry = () => {
    if (!newVelocity.sprintName || !newVelocity.committed || !newVelocity.completed) return;
    setVelocityHistory([...velocityHistory, newVelocity as VelocityEntry]);
    setNewVelocity({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Capacité du Sprint</h3>
        <p className="text-sm text-muted-foreground">Synthèse calculée à partir des données saisies</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <Card key={i} className={a.type === 'warning' ? 'bg-destructive/5 border-destructive/20' : 'bg-accent/50 border-accent'}>
              <CardContent className="pt-3 pb-3 flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${a.type === 'warning' ? 'text-destructive' : 'text-primary'}`} />
                <p className="text-sm">{a.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-muted">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Mode prudent</p>
            <p className="text-3xl font-bold text-muted-foreground">{capacity.prudentPoints}</p>
            <p className="text-xs text-muted-foreground">points (−15%)</p>
          </CardContent>
        </Card>
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-4 text-center">
            <Badge className="mb-2">Recommandé</Badge>
            <p className="text-3xl font-bold text-primary">{capacity.normalPoints}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </CardContent>
        </Card>
        <Card className="border-muted">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Mode agressif</p>
            <p className="text-3xl font-bold text-muted-foreground">{capacity.aggressivePoints}</p>
            <p className="text-xs text-muted-foreground">points (+5%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Global metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Jours ouvrés</p>
            </div>
            <p className="text-xl font-bold">{capacity.totalWorkDays}j</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Réunions</p>
            </div>
            <p className="text-xl font-bold">{capacity.totalMeetingHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Équipe</p>
            </div>
            <p className="text-xl font-bold">{members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Temps productif</p>
            </div>
            <p className="text-xl font-bold">{capacity.productivePercent}%</p>
            <Progress value={capacity.productivePercent} className="mt-1 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Per-member table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Capacité individuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Membre</th>
                  <th className="text-left py-2 font-medium">Rôle</th>
                  <th className="text-right py-2 font-medium">Jours dispo</th>
                  <th className="text-right py-2 font-medium">Absences</th>
                  <th className="text-right py-2 font-medium">Réunions</th>
                  <th className="text-right py-2 font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {capacity.members.map(m => (
                  <tr key={m.memberId} className="border-b border-border/50">
                    <td className="py-2 font-medium">{m.memberName}</td>
                    <td className="py-2 text-muted-foreground">{m.role}</td>
                    <td className="py-2 text-right">{m.availableDays}j</td>
                    <td className="py-2 text-right text-destructive">{m.absenceDays > 0 ? `-${m.absenceDays}j` : '—'}</td>
                    <td className="py-2 text-right text-muted-foreground">{m.meetingDays > 0 ? `-${m.meetingDays}j` : '—'}</td>
                    <td className="py-2 text-right font-bold text-primary">{m.points}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-2" colSpan={5}>Total</td>
                  <td className="py-2 text-right text-primary">{capacity.totalPoints}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Velocity history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Historique de vélocité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {velocityHistory.length > 0 && (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="sprintName" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="committed" name="Engagés" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Terminés" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Vélocité moyenne</p>
                  <p className="text-lg font-bold">{avgVelocity} pts</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Taux de livraison</p>
                  <p className="text-lg font-bold">{avgCommitment}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Capacité calculée</p>
                  <p className="text-lg font-bold text-primary">{capacity.normalPoints} pts</p>
                </div>
              </div>
            </>
          )}

          {/* Add velocity entry */}
          <div className="flex gap-2 items-end pt-2 border-t">
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Sprint</Label>
              <Input value={newVelocity.sprintName || ''} onChange={e => setNewVelocity({ ...newVelocity, sprintName: e.target.value })} placeholder="Sprint 12" className="h-8" />
            </div>
            <div className="space-y-1 w-24">
              <Label className="text-xs">Engagés</Label>
              <Input type="number" value={newVelocity.committed || ''} onChange={e => setNewVelocity({ ...newVelocity, committed: parseInt(e.target.value) || 0 })} className="h-8" />
            </div>
            <div className="space-y-1 w-24">
              <Label className="text-xs">Terminés</Label>
              <Input type="number" value={newVelocity.completed || ''} onChange={e => setNewVelocity({ ...newVelocity, completed: parseInt(e.target.value) || 0 })} className="h-8" />
            </div>
            <Button size="sm" variant="outline" onClick={addVelocityEntry} className="h-8"><Plus className="w-3 h-3" /></Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
        <Button variant="secondary" onClick={() => {
          // Could export or save — for now just a toast
          import('sonner').then(({ toast }) => toast.success('Capacité sprint calculée ! Utilisez ces données pour votre Sprint Planning.'));
        }}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Terminer
        </Button>
      </div>
    </div>
  );
};

export default StepCapacityResult;
