import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActivityItemProps {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  time: string;
}

export function ActivityItem({ icon: Icon, iconBg, title, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 px-2 py-2.5 rounded-xl">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-ink leading-snug line-clamp-2">{title}</p>
        <p className="text-xs text-ink-muted mt-0.5">{time}</p>
      </div>
    </div>
  );
}
