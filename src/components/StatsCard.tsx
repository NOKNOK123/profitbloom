import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  /** tint classes for the icon chip, e.g. "bg-violet-50 text-[#673AB7]" */
  iconBg: string;
  value: string;
  label: string;
  change: string;
  positive: boolean;
}

export function StatsCard({ icon: Icon, iconBg, value, label, change, positive }: StatsCardProps) {
  return (
    <div className="pb-card p-4 md:p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm text-ink-muted">{label}</p>
      </div>
      <p className="text-xl md:text-2xl font-semibold text-ink tracking-tight mb-1">{value}</p>
      <p className={`text-xs ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>{change}</p>
    </div>
  );
}
