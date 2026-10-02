import React from 'react';
import { CheckCircle2, TrendingDown } from 'lucide-react';
import { fmt, review, type Job, type Rules } from '../../lib/decision';

interface Props {
  job: Job;
  rules: Rules;
  applied: boolean;
  onApply: () => void;
  onCheckFirst: () => void;
}

/** Post-Event Profit Review — close the job with a lesson, not just "done". */
export function ReviewStage({ job, rules, applied, onApply, onCheckFirst }: Props) {
  const r = review(job, rules);
  if (!r.recorded)
    return (
      <div className="pb-card p-8 text-center">
        <p className="text-base font-semibold text-ink">ยังไม่มีต้นทุนจริง</p>
        <p className="text-sm text-ink-muted mt-1">กรอกต้นทุนจริงในขั้น "ติดตามต้นทุนจริง" ก่อน แล้วระบบจะสรุปกำไรจริงให้</p>
        <button type="button" onClick={onCheckFirst} className="pb-btn-primary mt-5">ไปกรอกต้นทุนจริง</button>
      </div>
    );

  const cards = [
    { label: 'เสนอราคา', value: r.quoted, cls: 'text-ink' },
    { label: 'กำไรที่คาด', value: r.expectedProfit, cls: 'text-ink' },
    { label: 'กำไรจริง', value: r.actualProfit, cls: r.actualProfit < r.expectedProfit ? 'text-rose-600' : 'text-emerald-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="pb-card p-4 md:p-5">
            <p className="text-xs text-ink-muted">{c.label}</p>
            <p className={`text-lg md:text-2xl font-semibold mt-1 ${c.cls}`}>฿{fmt(c.value)}</p>
          </div>
        ))}
      </div>

      <div className="pb-card p-5 md:p-6">
        {r.lost > 0.5 ? (
          <>
            <p className="flex items-center gap-2 text-base font-semibold text-ink">
              <TrendingDown className="w-5 h-5 text-rose-600" /> กำไรหายไป {fmt(r.lost)} บาท เพราะ
            </p>
            <ul className="mt-4 space-y-2">
              {r.overruns.map((o) => (
                <li key={o.name} className="flex items-center justify-between rounded-2xl bg-[#F7F6FA] px-4 py-3 text-sm">
                  <span className="text-ink">
                    {o.name}
                    {o.isExtra && <span className="ml-2 text-xs text-ink-muted">(นอกแผน)</span>}
                  </span>
                  <span className="font-semibold text-rose-600">+{fmt(o.diff)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="flex items-center gap-2 text-base font-semibold text-emerald-700">
            <CheckCircle2 className="w-5 h-5" /> กำไรจริงได้ตามที่คาด{r.lost < -0.5 ? ` และเหลือมากกว่าที่คาด ${fmt(-r.lost)} บาท` : ''}
          </p>
        )}
        {r.savings.length > 0 && (
          <p className="mt-4 text-sm text-ink-muted">ประหยัดได้: {r.savings.map((s) => `${s.name} ${fmt(-s.diff)} บาท`).join(', ')}</p>
        )}
        {r.laborOverrun && (
          <p className="mt-3 text-sm text-rose-700">Labor Overrun — ค่าแรงจริงเกินประมาณการ {r.laborOverrunPct.toFixed(0)}%</p>
        )}
      </div>

      <div className="pb-card p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink">นำข้อมูลจริงไปใช้ตั้งราคางานครั้งต่อไปหรือไม่?</p>
          <p className="text-xs text-ink-muted mt-1">ระบบจะเตือนให้เผื่อต้นทุนหมวดที่มักเกินงบ เมื่อคุณคิดราคางานใหม่</p>
        </div>
        {applied ? (
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="w-4 h-4" /> ใช้ข้อมูลงานนี้แล้ว</p>
        ) : (
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={onApply} className="pb-btn-primary">ใช่</button>
            <button type="button" onClick={onCheckFirst} className="pb-btn-secondary">ตรวจสอบก่อน</button>
          </div>
        )}
      </div>
    </div>
  );
}
