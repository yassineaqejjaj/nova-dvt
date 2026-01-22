import type { FC } from 'react';
import { AgentRole } from '@/types';
import { inferRoleFromSpecialty } from './RoleBadge';

interface StanceLineProps {
  stance?: string;
  role?: AgentRole;
  specialty?: string;
}

const STANCE_COLORS: Record<AgentRole, string> = {
  ux: 'text-pink-600 dark:text-pink-400',
  product: 'text-blue-600 dark:text-blue-400',
  data: 'text-emerald-600 dark:text-emerald-400',
  tech: 'text-orange-600 dark:text-orange-400',
  business: 'text-purple-600 dark:text-purple-400',
  strategy: 'text-amber-600 dark:text-amber-400',
};

export const StanceLine: FC<StanceLineProps> = ({ stance, role, specialty }) => {
  if (!stance) return null;

  const effectiveRole = role || inferRoleFromSpecialty(specialty);
  const colorClass = effectiveRole ? STANCE_COLORS[effectiveRole] : 'text-muted-foreground';

  return (
    <p className={`text-xs italic ${colorClass} mt-0.5 mb-1`}>
      "{stance}"
    </p>
  );
};
