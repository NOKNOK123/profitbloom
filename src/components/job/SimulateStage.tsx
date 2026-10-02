import React, { useState } from 'react';
import { ArrowRight, Minus, Plus, RotateCcw } from 'lucide-react';
import type { Project } from '../../lib/api';
import { fmt, NO_SCENARIO, simulate, type Job, type Rules, type Scenario } from '../../lib/decision';
import { blankItem } from './CostsStage';

interface Props {
  draft: Project;
  job: Job;
  rules: Rules;
  patch: (p: Partial<Project>) => void;
}

const CONTROLS: Array<{ key: keyof Scenario; label: string; unit: string; step: number; max: number }> = [
  { key: 'budgetCutPct', label: 'ลูกค้าลดงบ', unit: '%', step: 5, max: 50 },
  { key: 'materialUpPct', label: 'ราคาดอกไม้/วัสดุขึ้น', unit: '%', step: 5, max: 100 },
  { key: 'extraTeam', label: 'เพิ่มทีม', unit: 'คน', step: 1, max: 20 },
  { key: 'extraSetupDays', label: 'เพิ่มวันเซ็ตอัพ', unit: 'วัน', step: 1, max: 10 },
  { key: 'extraVehicles', label: 'เช่ารถเพิ่ม', unit: 'คัน', step: 1, max: 10 },
];

/** Scenario Simulator — "ถ้าเกิดว่า..." and see the effect straight away. */
export function SimulateStage({ draft, job, rules, patch }: Props) {
  const [s, setS] = useState<Scenario>(NO_SCENARIO);
  const r = simulate(job, s, rules);
  const changed = Object.values(s).some((v) => v !== 0);
  // functional update so quick repeated taps all count
  const step = (c: (typeof CONTROLS)[number], dir: 1 | -1) =>
    setS((prev) => ({ ...prev, [c.key]: Math.min(c.max, Math.max(0, prev[c.key] + dir * c.step)) }));

  const apply = () => {
    const days = draft.setupDays + draft.eventDays;
    const extra = [
      r.added.material > 0 && { ...blankItem('material'), name: `ดอกไม้/วัสดุราคาขึ้น ${s.materialUpPct}%`, price: Math.round(r.added.material) },
      r.added.team > 0 && { ...blankItem('labor'), name: `ทีมเพิ่ม ${s.extraTeam} คน × ${days} วัน`, quantity: s.extraTeam * days, price: rules.dailyWage },
      r.added.setup > 0 && { ...blankItem('labor'), name: `เซ็ตอัพเพิ่ม ${s.extraSetupDays} วัน`, quantity: s.extraSetupDays * ((draft.teamSize ?? 0) + s.extraTeam), price: rules.dailyWage },
      r.added.vehicles > 0 && { ...blankItem('transport'), name: `รถเพิ่ม ${s.extraVehicles} คัน`, quantity: s.extraVehicles, price: rules.vehicleCost },
    ]
      .filter(Boolean)
      .map((i: any) => ({ ...i, total: i.quantity * i.price }));
    patch({
      costItems: [...draft.costItems, ...extra],
      profitMargin: r.after.cost > 0 ? Math.max(0, (r.after.price / r.after.cost - 1) * 100) : draft.profitMargin,
      teamSize: s.extraTeam ? (draft.teamSize ?? 0) + s.extraTeam : draft.teamSize,
      setupDays: draft.setupDays + s.extraSetupDays,
    });
    setS(NO_SCENARIO);
  };

  const rows = [
    { label: 'ราคาขาย', before: `${fmt(r.before.price)}`, after: `${fmt(r.after.price)}` },
    { label: 'ต้นทุน', before: `${fmt(r.before.cost)}`, after: `${fmt(r.after.cost)}` },
    { label: 'Margin', before: `${r.before.margin.toFixed(1)}%`, after: `${r.after.margin.toFixed(1)}%` },
  ];
  const tone = r.after.margin < rules.highRiskMargin ? 'bg-rose-50 text-rose-700' : r.after.margin < r.target ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700';

  return (
    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
      <div className="pb-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-ink">ลองปรับเงื่อนไข</h3>
          {changed && (
            <button type="button" onClick={() => setS(NO_SCENARIO)} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink">
              <RotateCcw className="w-3.5 h-3.5" /> ล้าง
            </button>
          )}
        </div>
        <div className="space-y-3">
          {CONTROLS.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F6FA] px-4 py-3">
              <span className="text-sm text-ink">{c.label}</span>
              <div className="flex items-center gap-2">
                <button type="button" aria-label={`ลด ${c.label}`} onClick={() => step(c, -1)} className="w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center text-ink disabled:opacity-40" disabled={s[c.key] <= 0}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center text-sm font-semibold text-ink">{s[c.key]} {c.unit}</span>
                <button type="button" aria-label={`เพิ่ม ${c.label}`} onClick={() => step(c, 1)} className="w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center text-ink">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-muted">
          คิดค่าแรง {fmt(rules.dailyWage)} บาท/คน/วัน · ค่ารถ {fmt(rules.vehicleCost)} บาท/คัน (แก้ได้ที่ ตั้งค่า → กติกาธุรกิจ)
        </p>
      </div>

      <div className="pb-card p-5 md:p-6 flex flex-col">
        <h3 className="text-base md:text-lg font-semibold text-ink mb-4">ผลกระทบแบบ Real-time</h3>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between rounded-2xl bg-[#F7F6FA] px-4 py-3">
              <span className="text-sm text-ink-muted">{row.label}</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className={changed ? 'text-ink-muted font-normal' : ''}>{row.before}</span>
                {changed && (
                  <>
                    <ArrowRight className="w-4 h-4 text-ink-muted" />
                    {row.after}
                  </>
                )}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-[#F7F6FA] px-4 py-3">
              <p className="text-xs text-ink-muted">กำไร{r.profitChange < 0 ? 'ลดลง' : 'เปลี่ยนแปลง'}</p>
              <p className={`text-lg font-semibold ${r.profitChange < 0 ? 'text-rose-600' : 'text-ink'}`}>{fmt(Math.abs(r.profitChange))} บาท</p>
            </div>
            <div className="rounded-2xl bg-[#F7F6FA] px-4 py-3">
              <p className="text-xs text-ink-muted">ต้นทุนสูงสุดเพื่อรักษา Margin {r.target}%</p>
              <p className="text-lg font-semibold text-ink">{fmt(r.maxCostForTarget)} บาท</p>
            </div>
          </div>
        </div>
        <p className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${tone}`}>{changed ? r.advice : 'ปรับเงื่อนไขทางซ้ายเพื่อดูผลกระทบ'}</p>
        {changed && (
          <button type="button" onClick={apply} className="pb-btn-primary mt-4 self-start">
            นำเงื่อนไขนี้ไปใช้กับงาน
          </button>
        )}
      </div>
    </div>
  );
}
