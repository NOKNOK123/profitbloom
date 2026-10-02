import React, { useMemo, useState } from 'react';
import { AlertOctagon, CheckCircle2, ChevronDown, CircleAlert, FolderPlus } from 'lucide-react';
import { api, type Project, type User } from '../lib/api';
import { canTakeJob, fmt, type QuickAnswers } from '../lib/decision';
import { rulesOf } from '../lib/job';

interface Props {
  user: User;
  onCreated: (p: Project) => void;
}

const VERDICT = {
  take: { title: 'รับได้', text: 'Margin และเงินมัดจำอยู่ในเกณฑ์ปลอดภัย', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  adjust: { title: 'รับได้ แต่ควรปรับ', text: 'ราคา/ต้นทุน/เงื่อนไข ยังต้องแก้ก่อนตอบตกลง', icon: CircleAlert, cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
  risky: { title: 'เสี่ยงขาดทุน', text: 'กำไรต่ำ เงินสดไม่พอ หรือมีต้นทุนตกหล่น', icon: AlertOctagon, cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
} as const;

const PROJECT_TYPES = ['งานแต่งงาน', 'งานหมั้น', 'งานวันเกิด', 'งานบวช', 'งานเปิดร้าน', 'อื่นๆ'];

/** Can I Take This Job? — a quick answer for owners who aren't comfortable with accounts. */
export function QuickCheck({ user, onCreated }: Props) {
  const rules = useMemo(() => rulesOf(user), [user]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('งานแต่งงาน');
  const [a, setA] = useState<QuickAnswers>({
    budget: 0,
    materials: 0,
    rentals: 0,
    teamSize: 3,
    workDays: 2,
    dailyWage: rules.dailyWage,
    ownerLabor: 0,
    transport: 0,
    teardownIncluded: false,
    depositPct: rules.depositPct,
  });
  const [showWhy, setShowWhy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const ready = a.budget > 0 && a.materials + a.rentals + a.ownerLabor + a.transport + a.teamSize * a.workDays * a.dailyWage > 0;
  const r = canTakeJob(a, rules);
  const V = VERDICT[r.verdict];
  const set = (k: keyof QuickAnswers) => (e: React.ChangeEvent<HTMLInputElement>) => setA({ ...a, [k]: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)) });

  const questions: Array<[keyof QuickAnswers, string, string]> = [
    ['budget', '1. งบที่ลูกค้าเสนอ (บาท)', 'ราคาที่ลูกค้าบอกว่าจ่ายได้'],
    ['materials', '2. ค่าดอกไม้และวัสดุโดยประมาณ', 'รวมดอกไม้ โฟม ริบบิ้น ฯลฯ'],
    ['rentals', '3. ค่าเช่าอุปกรณ์/พร็อพ', 'โครงซุ้ม แจกัน ผ้า ไฟ'],
    ['teamSize', '4. จำนวนทีมงาน (คน)', 'ไม่รวมตัวคุณเอง'],
    ['workDays', '5. ทำงานกี่วัน (รวมวันเซ็ตอัพ)', 'จำนวนวันที่ต้องจ่ายค่าแรง'],
    ['dailyWage', '6. ค่าแรงต่อคนต่อวัน (บาท)', `ค่าเริ่มต้นจากกติกาของร้าน ${fmt(rules.dailyWage)}`],
    ['ownerLabor', '7. ค่าแรงของคุณเอง (บาท)', 'เวลาของคุณคือต้นทุน ใส่ 0 ถ้ายังไม่คิด'],
    ['transport', '8. ค่าขนส่ง/รถ (บาท)', 'ค่ารถ น้ำมัน ทางด่วน'],
    ['depositPct', '9. ลูกค้าจ่ายมัดจำกี่ %', 'เงินที่ได้ก่อนวันงาน'],
  ];

  const createProject = async () => {
    setCreating(true);
    setError('');
    try {
      const j = r.job;
      const p = await api.createProject({
        title: title.trim() || `${type} - งบ ${fmt(a.budget)} บาท`,
        projectType: type,
        budget: a.budget,
        profitMargin: j.profitMargin,
        depositPct: j.depositPct,
        setupDays: j.setupDays,
        eventDays: j.eventDays,
        laborDays: j.laborDays,
        teamSize: j.teamSize,
        ownerLabor: j.ownerLabor,
        teardown: j.teardown,
        costItems: j.costItems,
      });
      onCreated(p);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-5 md:p-10 pb-28 md:pb-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-[28px] font-semibold text-ink tracking-tight">เช็คก่อนรับงาน</h1>
        <p className="text-sm text-ink-muted mt-1">ใส่งบที่ลูกค้าเสนอ แล้วตอบคำถามสั้น ๆ 10 ข้อ — รู้ทันทีว่างานนี้ควรรับไหม</p>
      </div>

      <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-5 items-start">
        <div className="pb-card p-5 md:p-6">
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div>
              <label className="pb-label">ชื่องาน (ไม่บังคับ)</label>
              <input className="pb-input !py-2" value={title} placeholder="เช่น งานแต่ง คุณนิภา" onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="pb-label">ประเภทงาน</label>
              <select className="pb-input !py-2" value={type} onChange={(e) => setType(e.target.value)}>
                {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-4">
            {questions.map(([k, label, hint]) => (
              <div key={k} className={k === 'budget' ? 'sm:col-span-2' : ''}>
                <label className="pb-label !text-ink">{label}</label>
                <input
                  className={`pb-input !py-2 ${k === 'budget' ? '!text-lg font-semibold' : ''}`}
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={a[k] === 0 && k !== 'teamSize' && k !== 'workDays' ? '' : (a[k] as number)}
                  placeholder="0"
                  onChange={set(k)}
                />
                <p className="text-xs text-ink-muted mt-1">{hint}</p>
              </div>
            ))}
            <div className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl bg-[#F7F6FA] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">10. ค่าขนส่งรวมเก็บงานและขนกลับแล้ว?</p>
                <p className="text-xs text-ink-muted">งานส่วนใหญ่ต้องรื้อถอนหลังงาน</p>
              </div>
              <div className="flex bg-white rounded-full p-1 shrink-0 shadow-card">
                {[
                  [true, 'รวมแล้ว'],
                  [false, 'ยังไม่รวม'],
                ].map(([v, t]) => (
                  <button key={String(v)} type="button" onClick={() => setA({ ...a, teardownIncluded: v as boolean })} className={`px-3 py-1.5 text-xs rounded-full ${a.teardownIncluded === v ? 'bg-[#673AB7] text-white font-medium' : 'text-ink-muted'}`}>
                    {t as string}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="xl:sticky xl:top-6 space-y-4">
          {!ready ? (
            <div className="pb-card p-8 text-center">
              <p className="text-base font-semibold text-ink">ใส่งบลูกค้าและต้นทุนโดยประมาณ</p>
              <p className="text-sm text-ink-muted mt-1">ผลลัพธ์จะขึ้นที่นี่ทันที</p>
            </div>
          ) : (
            <>
              <div className={`rounded-[24px] p-6 ring-1 ${V.cls}`}>
                <V.icon className="w-8 h-8" />
                <p className="text-2xl font-semibold mt-3">{V.title}</p>
                <p className="text-sm mt-1 opacity-90">{V.text}</p>
                {r.fixes.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm font-medium list-disc pl-5">
                    {r.fixes.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                )}
              </div>
              <div className="pb-card p-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['ต้นทุนรวม', `${fmt(r.cost)} บาท`],
                    ['กำไรที่งบนี้', `${fmt(r.profit)} บาท`],
                    ['Margin', `${r.margin.toFixed(1)}%`],
                    ['เงินสดสำรองก่อนงาน', `${fmt(r.cashRequired)} บาท`],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-[#F7F6FA] px-3 py-2.5">
                      <p className="text-xs text-ink-muted">{l}</p>
                      <p className="font-semibold text-ink">{v}</p>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setShowWhy(!showWhy)} className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#5A42C6]" aria-expanded={showWhy}>
                  ดูเหตุผลและสูตรคำนวณ <ChevronDown className={`w-4 h-4 transition-transform ${showWhy ? 'rotate-180' : ''}`} />
                </button>
                {showWhy && (
                  <ul className="mt-3 space-y-2 text-sm text-ink leading-relaxed list-disc pl-5">
                    {r.reasons.map((x) => <li key={x}>{x}</li>)}
                    <li>เกณฑ์ของร้าน: Margin ต่ำกว่า {rules.highRiskMargin}% = เสี่ยงสูง, เป้าขั้นต่ำ {rules.minMargin}%</li>
                  </ul>
                )}
              </div>
              <button type="button" onClick={createProject} disabled={creating} className="pb-btn-primary w-full !py-3 disabled:opacity-60">
                <FolderPlus className="w-4 h-4" />
                {creating ? 'กำลังสร้าง...' : 'สร้างโปรเจ็กต์จากข้อมูลนี้'}
              </button>
              <p className="text-xs text-ink-muted text-center">ข้อมูลทั้งหมดจะถูกนำไปใช้ต่อ ไม่ต้องกรอกซ้ำ</p>
              {error && <p className="text-sm text-rose-600 text-center">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
