import React from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import type { CostItem, Project } from '../../lib/api';
import { categoryLabel, COST_CATEGORIES, fmt, review, type CostCategory, type Job, type Rules } from '../../lib/decision';
import { blankItem } from './CostsStage';

interface Props {
  draft: Project;
  job: Job;
  rules: Rules;
  patch: (p: Partial<Project>) => void;
}

const input = 'pb-input !py-2';

/** Track the budget during the job: actual cost per line, plus anything bought on the day. */
export function DeliverStage({ draft, job, rules, patch }: Props) {
  const r = review(job, rules);
  const setItem = (id: number, change: Partial<CostItem>) => patch({ costItems: draft.costItems.map((i) => (i.id === id ? { ...i, ...change } : i)) });
  const addExtra = () => patch({ costItems: [...draft.costItems, { ...blankItem('other'), name: '', quantity: 0, price: 0, total: 0, actual: 0, isExtra: true, paidBefore: false }] });
  const remove = (id: number) => patch({ costItems: draft.costItems.filter((i) => i.id !== id) });
  const planned = draft.costItems.filter((i) => !i.isExtra);
  const extras = draft.costItems.filter((i) => i.isExtra);
  const used = r.expectedCost > 0 ? Math.min(150, (r.actualCost / r.expectedCost) * 100) : 0;
  const parse = (v: string) => (v === '' ? null : Math.max(0, Number(v)));

  return (
    <div className="space-y-5">
      <div className="pb-card p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <div>
            <p className="text-sm text-ink-muted">ใช้งบไปแล้ว</p>
            <p className="text-2xl font-semibold text-ink">
              ฿{fmt(r.actualCost)} <span className="text-base font-normal text-ink-muted">/ ฿{fmt(r.expectedCost)}</span>
            </p>
          </div>
          <p className={`text-sm font-medium ${r.actualProfit < r.expectedProfit ? 'text-rose-600' : 'text-emerald-600'}`}>
            กำไรตอนนี้ ฿{fmt(r.actualProfit)} (คาดไว้ ฿{fmt(r.expectedProfit)})
          </p>
        </div>
        <div className="h-2.5 rounded-full bg-[#F1F0F5] overflow-hidden">
          <div className={`h-full rounded-full ${used > 100 ? 'bg-rose-500' : 'bg-[#673AB7]'}`} style={{ width: `${Math.min(100, used)}%` }} />
        </div>
        {r.laborOverrun && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            Labor Overrun: ค่าแรงจริงเกินประมาณการ {r.laborOverrunPct.toFixed(0)}% (เกณฑ์ {rules.laborOverrunPct}%)
          </p>
        )}
      </div>

      <div className="pb-card p-5 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-ink">ต้นทุนจริงรายรายการ</h3>
        <p className="text-xs text-ink-muted mb-4">เว้นว่างไว้ = ยังเท่ากับที่ประมาณ</p>
        <div className="space-y-2">
          {planned.map((i) => {
            const est = i.quantity * i.price;
            const diff = i.actual === null ? 0 : i.actual - est;
            return (
              <div key={i.id} className="grid grid-cols-[1fr_auto] xl:grid-cols-[1.5fr_0.8fr_0.9fr_0.7fr] gap-2 xl:gap-4 items-center rounded-2xl bg-[#F7F6FA] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{i.name || categoryLabel(i.category)}</p>
                  <p className="text-xs text-ink-muted">{categoryLabel(i.category)}</p>
                </div>
                <p className="text-sm text-ink-muted xl:text-right">ประมาณ ฿{fmt(est)}</p>
                <input className={`${input} col-span-1`} type="number" min="0" inputMode="decimal" placeholder={String(Math.round(est))} aria-label={`ต้นทุนจริง ${i.name}`} value={i.actual ?? ''} onChange={(e) => setItem(i.id, { actual: parse(e.target.value) })} />
                <p className={`text-sm font-medium xl:text-right ${diff > 0 ? 'text-rose-600' : diff < 0 ? 'text-emerald-600' : 'text-ink-muted'}`}>
                  {diff === 0 ? '—' : `${diff > 0 ? '+' : '−'}฿${fmt(Math.abs(diff))}`}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-ink">ค่าใช้จ่ายนอกแผน</h4>
            <p className="text-xs text-ink-muted">เช่น ซื้อของหน้างาน OT ทีม ค่ารถเพิ่ม</p>
          </div>
          <button type="button" onClick={addExtra} className="pb-btn-secondary !py-2">
            <Plus className="w-4 h-4" /> เพิ่ม
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {extras.map((i) => (
            <div key={i.id} className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_0.9fr_auto] gap-2 items-center">
              <input className={`${input} col-span-2 md:col-span-1`} placeholder="รายการ" value={i.name} onChange={(e) => setItem(i.id, { name: e.target.value })} />
              <select className={input} value={i.category} onChange={(e) => setItem(i.id, { category: e.target.value as CostCategory })}>
                {COST_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <input className={input} type="number" min="0" inputMode="decimal" placeholder="จำนวนเงิน" value={i.actual ?? ''} onChange={(e) => setItem(i.id, { actual: parse(e.target.value) })} />
              <button type="button" onClick={() => remove(i.id)} aria-label="ลบ" className="justify-self-end p-2 rounded-full text-ink-muted hover:text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
