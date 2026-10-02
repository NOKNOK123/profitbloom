import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

interface ProjectItemProps {
  title: string;
  date: string;
  budget: string;
  status: string;
  statusText: string;
  onClick?: () => void;
}

export const statusPill = (status: string) => {
  switch (status) {
    case 'quote_created':
    case 'sent':
      return 'bg-sky-50 text-sky-700';
    case 'pending':
      return 'bg-amber-50 text-amber-700';
    case 'approved':
      return 'bg-emerald-50 text-emerald-700';
    case 'completed':
      return 'bg-violet-50 text-[#673AB7]';
    case 'cancelled':
    case 'rejected':
      return 'bg-rose-50 text-rose-600';
    case 'expired':
      return 'bg-orange-50 text-orange-700';
    default:
      return 'bg-[#F1F0F5] text-ink-muted';
  }
};

export function ProjectItem({ title, date, budget, status, statusText, onClick }: ProjectItemProps) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 py-3.5 text-left group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{title}</p>
        <p className="flex items-center gap-1.5 text-xs text-ink-muted mt-1">
          <Calendar className="w-3.5 h-3.5" />
          {date}
        </p>
      </div>
      <span className="hidden sm:block text-sm font-medium text-ink">{budget}</span>
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusPill(status)}`}>{statusText}</span>
      <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink" />
    </button>
  );
}
