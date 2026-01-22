import type { FC, ElementType } from 'react';
import { Badge } from '@/components/ui/badge';
import { AgentRole } from '@/types';
import { Palette, Package, BarChart3, Code, Briefcase, Target } from 'lucide-react';

interface RoleBadgeProps {
  role?: AgentRole;
  specialty?: string;
  size?: 'sm' | 'md';
}

const ROLE_CONFIG: Record<AgentRole, { 
  label: string; 
  icon: ElementType; 
  className: string;
}> = {
  ux: { 
    label: 'UX', 
    icon: Palette, 
    className: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800'
  },
  product: { 
    label: 'Product', 
    icon: Package, 
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  data: { 
    label: 'Data', 
    icon: BarChart3, 
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  tech: { 
    label: 'Tech', 
    icon: Code, 
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800'
  },
  business: { 
    label: 'Business', 
    icon: Briefcase, 
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  },
  strategy: { 
    label: 'Strategy', 
    icon: Target, 
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
};

// Infer role from specialty if not explicitly set
function inferRole(specialty?: string): AgentRole | undefined {
  if (!specialty) return undefined;
  const lower = specialty.toLowerCase();
  
  if (lower.includes('ux') || lower.includes('design') || lower.includes('user experience')) return 'ux';
  if (lower.includes('product') || lower.includes('pm') || lower.includes('management')) return 'product';
  if (lower.includes('data') || lower.includes('analytics') || lower.includes('insight')) return 'data';
  if (lower.includes('tech') || lower.includes('engineer') || lower.includes('develop') || lower.includes('architecture')) return 'tech';
  if (lower.includes('business') || lower.includes('market') || lower.includes('sales') || lower.includes('growth')) return 'business';
  if (lower.includes('strategy') || lower.includes('vision') || lower.includes('leader')) return 'strategy';
  
  return undefined;
}

export const RoleBadge: FC<RoleBadgeProps> = ({ role, specialty, size = 'sm' }) => {
  const effectiveRole = role || inferRole(specialty);
  
  if (!effectiveRole) {
    return (
      <Badge variant="secondary" className={size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-sm px-2 py-0.5'}>
        {specialty || 'Agent'}
      </Badge>
    );
  }

  const config = ROLE_CONFIG[effectiveRole];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${size === 'sm' ? 'text-xs px-1.5 py-0 gap-1' : 'text-sm px-2 py-0.5 gap-1.5'} font-medium border`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </Badge>
  );
};

export const inferRoleFromSpecialty = inferRole;
