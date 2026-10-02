import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { fmt, type health, type Risk } from '../../lib/decision';
import { LEVEL_STYLE } from '../../lib/job';

type Health = ReturnType<typeof health>;

export function ScoreRing({ score, level, size = 120 }: { score: number; level: Health['level']; size?: number }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F0F5" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={LEVEL_STYLE[level].ring}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-ink leading-none">{score}</span>
        <span className="text-xs text-ink-muted mt-1">/ 100</span>
      </div>
    </div>
  );
}

const SEVERITY = {
  high: { icon: AlertTriangle, cls: 'bg-rose-50 text-rose-600' },
  medium: { icon: AlertTriangle, cls: 'bg-amber-50 text-amber-600' },
  low: { icon: Info, cls: 'bg-sky-50 text-sky-600' },
} as const;

export function RiskList({ risks, empty = 'ไม่พบจุดเสี่ยง พร้อมเสนอราคาได้' }: { risks: Risk[]; empty?: string }) {
  if (risks.length === 0)
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
        <CheckCircle2 className="w-4 h-4" /> {empty}
      </p>
    );
  return (
    <ul className="space-y-2">
      {risks.map((r) => {
        const S = SEVERITY[r.severity];
        return (
          <li key={r.id} className="flex gap-3 rounded-xl border border-line px-4 py-3 bg-white">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${S.cls}`}>
              <S.icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{r.title}</p>
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{r.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Job Health Check — the whole job on one screen; the status should be readable within 10 seconds. */
export function HealthPanel({ h, budget }: { h: Health; budget?: number }) {
  const metrics = [
    { label: 'Margin', value: `${h.margin.toFixed(1)}%`, hint: `กำไร ${fmt(h.profit)} บาท จากราคา ${fmt(h.price)}` },
    { label: 'เงินสดที่ต้องสำรอง', value: `${fmt(h.cashRequired)} บาท`, hint: `ก่อนงาน · มัดจำได้ ${fmt(h.deposit)}` },
    { label: 'ราคาคุ้มทุน (Break-even)', value: `${fmt(h.breakEven)} บาท`, hint: 'ต่ำกว่านี้คือขาดทุน' },
    { label: 'ช่วงราคาแนะนำ', value: `${fmt(h.recommended[0])}–${fmt(h.recommended[1])}`, hint: budget ? `งบลูกค้า ${fmt(budget)} บาท` : 'ตาม Margin เป้าหมายของร้าน' },
  ];
  return (
    <div className="pb-card p-5 md:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
        <ScoreRing score={h.score} level={h.level} />
        <div>
          <p className="text-xs font-medium text-ink-muted tracking-wide">JOB HEALTH SCORE</p>
          <p className="text-2xl font-semibold text-ink mt-1">{h.label}</p>
          <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${LEVEL_STYLE[h.level].chip}`}>
            {h.risks.length === 0 ? 'ไม่มีจุดเสี่ยง' : `พบ ${h.risks.length} จุดที่ควรตรวจ`}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl bg-[#F7F6FA] p-4">
            <p className="text-xs text-ink-muted">{m.label}</p>
            <p className="text-lg md:text-xl font-semibold text-ink mt-1 whitespace-nowrap">{m.value}</p>
            <p className="text-[11px] text-ink-muted mt-1 leading-snug">{m.hint}</p>
          </div>
        ))}
      </div>
      <p className="text-sm font-semibold text-ink mb-3">สิ่งที่ควรตรวจก่อนเสนอราคา</p>
      <RiskList risks={h.risks} />
    </div>
  );
}
