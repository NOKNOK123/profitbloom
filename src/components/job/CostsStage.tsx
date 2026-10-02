import React, { useEffect, useState } from 'react';
import { Lightbulb, Plus, Trash2 } from 'lucide-react';
import type { CostItem, Project } from '../../lib/api';
import {
  categoryLabel,
  COST_CATEGORIES,
  fmt,
  marginToMarkup,
  markupToMargin,
  type CostCategory,
  type health,
  type learnings,
  type Rules,
} from '../../lib/decision';

interface Props {
  draft: Project;
  patch: (p: Partial<Project>) => void;
  rules: Rules;
  h: ReturnType<typeof health>;
  lessons: ReturnType<typeof learnings>;
}

const input = 'pb-input !py-2';
let tempId = -1;

export function blankItem(category: CostCategory = 'material'): CostItem {
  return {
    id: tempId--,
    name: '',
    category,
    quantity: 1,
    price: 0,
    total: 0,
    paidBefore: COST_CATEGORIES.find((c) => c.id === category)!.paidBefore,
    actual: null,
    isExtra: false,
  };
}

/** A number field for derived values (price ↔ margin): keeps what the user types and commits on blur / Enter. */
function CommitNumber({ value, onCommit, disabled, ...rest }: { value: number; onCommit: (v: number) => void; disabled?: boolean; min?: string; max?: string; step?: string; 'aria-label'?: string }) {
  const [text, setText] = useState(String(value));
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);
  const commit = () => {
    setEditing(false);
    if (text.trim() !== '' && Number.isFinite(Number(text))) onCommit(Number(text));
    else setText(String(value));
  };
  return (
    <input
      {...rest}
      className={input}
      type="number"
      inputMode="decimal"
      disabled={disabled}
      value={text}
      onFocus={() => setEditing(true)}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
    />
  );
}

/** Yes / No / not answered — the Quote Health Check treats "not answered" as a risk. */
function YesNo({ label, value, onChange, hint }: { label: string; value: boolean | null; onChange: (v: boolean) => void; hint: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-line last:border-0">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-muted">{hint}</p>
      </div>
      <div className="flex bg-[#F1F0F5] rounded-full p-1 shrink-0">
        {[
          [true, 'ใส่แล้ว'],
          [false, 'ยังไม่ใส่'],
        ].map(([v, t]) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v as boolean)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${value === v ? 'bg-white shadow-card text-ink font-medium' : 'text-ink-muted'}`}
          >
            {t as string}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CostsStage({ draft, patch, rules, h, lessons }: Props) {
  const items = draft.costItems.filter((i) => !i.isExtra);
  const setItem = (id: number, change: Partial<CostItem>) =>
    patch({
      costItems: draft.costItems.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i, ...change };
        if (change.category && change.paidBefore === undefined) next.paidBefore = COST_CATEGORIES.find((c) => c.id === change.category)!.paidBefore;
        return { ...next, total: next.quantity * next.price };
      }),
    });
  const addItem = (category: CostCategory = 'material', name = '', price = 0) =>
    patch({ costItems: [...draft.costItems, { ...blankItem(category), name, price, total: price }] });
  const removeItem = (id: number) => patch({ costItems: draft.costItems.filter((i) => i.id !== id) });

  const margin = markupToMargin(draft.profitMargin);
  const setMargin = (m: number) => patch({ profitMargin: marginToMarkup(Math.min(95, Math.max(0, m))) });
  const setPrice = (price: number) => patch({ profitMargin: h.cost > 0 ? Math.max(0, (price / h.cost - 1) * 100) : draft.profitMargin });
  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <div className="space-y-5">
      {lessons.length > 0 && (
        <div className="rounded-2xl bg-violet-50 px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#5A42C6]">
            <Lightbulb className="w-4 h-4" /> บทเรียนจากงานที่ผ่านมา
          </p>
          <ul className="mt-2 space-y-2">
            {lessons.map((l) => {
              const base = items.filter((i) => i.category === l.category).reduce((s, i) => s + i.quantity * i.price, 0);
              const buffer = Math.round((base * l.overrunPct) / 100);
              return (
                <li key={l.category} className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink">
                  <span>
                    {categoryLabel(l.category)} เกินงบเฉลี่ย {l.overrunPct.toFixed(0)}% ({l.jobs} งาน)
                  </span>
                  {buffer > 0 && (
                    <button type="button" onClick={() => addItem('other', `เผื่อ${categoryLabel(l.category)}เกินงบ ${l.overrunPct.toFixed(0)}%`, buffer)} className="text-xs font-medium text-[#5A42C6] hover:underline">
                      + เผื่อไว้ {fmt(buffer)} บาท
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Cost items */}
      <div className="pb-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-ink">รายการต้นทุน</h3>
            <p className="text-xs text-ink-muted">ติ๊ก "จ่ายก่อนงาน" กับรายการที่ต้องจ่ายเงินก่อนได้รับเงินจากลูกค้า</p>
          </div>
          <button type="button" onClick={() => addItem()} className="pb-btn-secondary !py-2 shrink-0">
            <Plus className="w-4 h-4" /> เพิ่มรายการ
          </button>
        </div>

        <div className="hidden xl:grid grid-cols-[1.6fr_1fr_0.6fr_0.9fr_0.9fr_0.6fr_auto] gap-3 px-1 pb-2 text-xs font-medium text-ink-muted">
          <span>รายการ</span><span>หมวด</span><span>จำนวน</span><span>ราคา/หน่วย</span><span className="text-right">รวม</span><span className="text-center">จ่ายก่อนงาน</span><span />
        </div>
        <div className="space-y-3 xl:space-y-2">
          {items.length === 0 && <p className="text-sm text-ink-muted py-6 text-center">ยังไม่มีรายการ กด "เพิ่มรายการ" เพื่อเริ่ม</p>}
          {items.map((i) => (
            <div key={i.id} className="grid grid-cols-2 sm:grid-cols-[1.5fr_0.8fr_1fr_0.8fr] xl:grid-cols-[1.6fr_1fr_0.6fr_0.9fr_0.9fr_0.6fr_auto] gap-2 xl:gap-3 items-center rounded-2xl xl:rounded-none bg-[#F7F6FA] xl:bg-transparent p-3 xl:p-0">
              <input className={`${input} col-span-2 sm:col-span-4 xl:col-span-1`} value={i.name} placeholder="เช่น ดอกกุหลาบขาว" onChange={(e) => setItem(i.id, { name: e.target.value })} />
              <div>
                <span className="xl:hidden block text-[11px] text-ink-muted mb-1">หมวด</span>
                <select className={input} aria-label="หมวด" value={i.category} onChange={(e) => setItem(i.id, { category: e.target.value as CostCategory })}>
                  {COST_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <span className="xl:hidden block text-[11px] text-ink-muted mb-1">จำนวน</span>
                <input className={input} type="number" min="0" inputMode="decimal" aria-label="จำนวน" value={i.quantity} onChange={(e) => setItem(i.id, { quantity: num(e.target.value) })} />
              </div>
              <div>
                <span className="xl:hidden block text-[11px] text-ink-muted mb-1">ราคา/หน่วย</span>
                <input className={input} type="number" min="0" inputMode="decimal" aria-label="ราคาต่อหน่วย" value={i.price} onChange={(e) => setItem(i.id, { price: num(e.target.value) })} />
              </div>
              <div><span className="xl:hidden block text-[11px] text-ink-muted mb-1">รวม</span><p className="text-sm font-semibold text-ink xl:text-right py-2 xl:py-0">฿{fmt(i.quantity * i.price)}</p></div>
              <label className="flex items-center xl:justify-center gap-2 text-xs text-ink-muted">
                <input type="checkbox" className="w-4 h-4 accent-[#673AB7]" checked={i.paidBefore} onChange={(e) => setItem(i.id, { paidBefore: e.target.checked })} />
                <span className="xl:hidden">จ่ายก่อนงาน</span>
              </label>
              <button type="button" onClick={() => removeItem(i.id)} aria-label="ลบรายการ" className="justify-self-end p-2 rounded-full text-ink-muted hover:text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-line flex flex-wrap justify-between gap-2 text-sm">
          <span className="text-ink-muted">ต้นทุนรวม</span>
          <span className="font-semibold text-ink">฿{fmt(h.cost)}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Conditions */}
        <div className="pb-card p-5 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-ink mb-4">เงื่อนไขงาน</h3>
          <div className="grid grid-cols-2 gap-3 mb-2">
            {[
              ['วันเซ็ตอัพ', 'setupDays', draft.setupDays],
              ['วันงาน', 'eventDays', draft.eventDays],
              ['จำนวนทีมงาน (คน)', 'teamSize', draft.teamSize],
              ['ค่าแรงคิดกี่วัน', 'laborDays', draft.laborDays],
            ].map(([label, key, value]) => (
              <div key={key as string}>
                <label className="pb-label">{label as string}</label>
                <input
                  className={input}
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={value === null ? '' : (value as number)}
                  placeholder="—"
                  onChange={(e) => patch({ [key as string]: e.target.value === '' ? (key === 'setupDays' || key === 'eventDays' ? 0 : null) : Number(e.target.value) } as Partial<Project>)}
                />
              </div>
            ))}
          </div>
          <YesNo label="ค่าแรงเจ้าของ" hint="เวลาของคุณคือต้นทุนของงาน" value={draft.ownerLabor} onChange={(v) => patch({ ownerLabor: v })} />
          <YesNo label="ค่าเก็บงานและขนส่งกลับ" hint="รื้อถอนและขนของกลับหลังงาน" value={draft.teardown} onChange={(v) => patch({ teardown: v })} />
        </div>

        {/* Pricing */}
        <div className="pb-card p-5 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-ink mb-4">ราคาเสนอ</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pb-label">งบที่ลูกค้าเสนอ (บาท)</label>
              <input className={input} type="number" min="0" inputMode="decimal" value={draft.budget || ''} placeholder="ไม่ทราบ" onChange={(e) => patch({ budget: num(e.target.value) })} />
            </div>
            <div>
              <label className="pb-label">มัดจำ (%)</label>
              <input className={input} type="number" min="0" max="100" inputMode="decimal" value={draft.depositPct} onChange={(e) => patch({ depositPct: num(e.target.value) })} />
            </div>
            <div>
              <label className="pb-label">Margin (%)</label>
              <CommitNumber min="0" max="95" step="0.1" aria-label="Margin" value={Number(margin.toFixed(1))} onCommit={setMargin} />
            </div>
            <div>
              <label className="pb-label">ราคาขาย (บาท)</label>
              <CommitNumber min="0" aria-label="ราคาขาย" value={Math.round(h.price)} disabled={h.cost <= 0} onCommit={setPrice} />
            </div>
          </div>
          <p className="mt-2 text-xs text-ink-muted">Margin = กำไร ÷ ราคาขาย · แก้ช่องใดช่องหนึ่ง แล้วกด Enter อีกช่องจะคำนวณให้</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              [`Margin ขั้นต่ำ ${rules.minMargin}%`, rules.minMargin],
              [`Margin ที่ดี ${rules.goodMargin}%`, rules.goodMargin],
            ].map(([label, m]) => (
              <button key={label as string} type="button" onClick={() => setMargin(m as number)} className="px-3 py-1.5 rounded-full bg-[#F1F0F5] text-xs text-ink hover:bg-[#E8E6EF]">
                ตั้งราคาที่ {label as string}
              </button>
            ))}
            {draft.budget > 0 && h.cost > 0 && (
              <button type="button" onClick={() => setPrice(draft.budget)} className="px-3 py-1.5 rounded-full bg-[#F1F0F5] text-xs text-ink hover:bg-[#E8E6EF]">
                ตั้งราคาเท่างบลูกค้า
              </button>
            )}
          </div>
          <div className="mt-5 pt-4 border-t border-line space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-ink-muted">ต้นทุนรวม</span><span className="text-ink">฿{fmt(h.cost)}</span></div>
            <div className="flex justify-between"><span className="text-ink-muted">กำไร</span><span className="text-emerald-600 font-medium">฿{fmt(h.profit)}</span></div>
            <div className="flex justify-between text-base"><span className="font-semibold text-ink">ราคาเสนอขาย</span><span className="font-semibold text-ink">฿{fmt(h.price)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
