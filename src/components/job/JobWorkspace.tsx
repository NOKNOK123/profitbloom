import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Trash2, X } from 'lucide-react';
import { api, type Project, type ProjectStatus, type User } from '../../lib/api';
import { health, learnings } from '../../lib/decision';
import { rulesOf, toJob } from '../../lib/job';
import { statusPill } from '../ProjectItem';
import { HealthPanel, RiskList } from './HealthPanel';
import { CostsStage } from './CostsStage';
import { SimulateStage } from './SimulateStage';
import { DeliverStage } from './DeliverStage';
import { ReviewStage } from './ReviewStage';

export type Stage = 'check' | 'quote' | 'simulate' | 'deliver' | 'review';

const STAGES: Array<{ id: Stage; step: string; title: string; hint: string }> = [
  { id: 'check', step: '1', title: 'เช็คสุขภาพงาน', hint: 'Pre-check' },
  { id: 'quote', step: '2', title: 'ต้นทุนและราคา', hint: 'Build Quote' },
  { id: 'simulate', step: '3', title: 'จำลองสถานการณ์', hint: 'Simulate' },
  { id: 'deliver', step: '4', title: 'ติดตามต้นทุนจริง', hint: 'Deliver' },
  { id: 'review', step: '5', title: 'สรุปหลังงาน', hint: 'Review' },
];

const STATUSES: Array<[ProjectStatus, string]> = [
  ['draft', 'ร่าง'],
  ['quote_created', 'สร้างใบเสนอราคาแล้ว'],
  ['pending', 'รอการอนุมัติ'],
  ['approved', 'อนุมัติแล้ว'],
  ['completed', 'เสร็จสิ้น'],
  ['cancelled', 'ยกเลิก'],
];

const PROJECT_TYPES = ['งานแต่งงาน', 'งานหมั้น', 'งานวันเกิด', 'งานบวช', 'งานเปิดร้าน', 'อื่นๆ'];

interface Props {
  project: Project;
  user: User;
  onBack: () => void;
  onUpdate: (p: Project) => Promise<Project>;
  onDelete: (id: string) => Promise<void>;
  onCreateQuote: (p: Project) => void;
  startStage?: Stage;
}

export function JobWorkspace({ project, user, onBack, onUpdate, onDelete, onCreateQuote, startStage }: Props) {
  const [draft, setDraft] = useState<Project>(project);
  const [stage, setStage] = useState<Stage>(startStage ?? (['approved', 'completed'].includes(project.status) ? 'deliver' : 'check'));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [quoteCheck, setQuoteCheck] = useState(false);
  const [history, setHistory] = useState<Project[]>([]);

  useEffect(() => setDraft(project), [project]);
  useEffect(() => {
    api.projects().then(setHistory).catch(() => {});
  }, []);

  const rules = useMemo(() => rulesOf(user), [user]);
  const job = useMemo(() => toJob(draft), [draft]);
  const h = useMemo(() => health(job, rules), [job, rules]);
  const lessons = useMemo(() => learnings(history.filter((p) => p.reviewApplied && p.id !== draft.id).map(toJob)), [history, draft.id]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(project);

  const patch = (p: Partial<Project>) => setDraft((d) => ({ ...d, ...p }));
  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(''), 3000);
  };

  const save = async (override?: Partial<Project>) => {
    if (!draft.title.trim()) return flash('กรุณากรอกชื่องาน');
    setSaving(true);
    try {
      await onUpdate({ ...draft, ...override });
      flash('บันทึกแล้ว');
      return true;
    } catch (err) {
      flash((err as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    if (dirty && !window.confirm('มีการแก้ไขที่ยังไม่บันทึก ออกจากหน้านี้เลยหรือไม่?')) return;
    onBack();
  };

  const remove = async () => {
    if (!window.confirm(`ลบงาน "${project.title}" ใช่หรือไม่?`)) return;
    try {
      await onDelete(project.id);
      onBack();
    } catch (err) {
      flash((err as Error).message);
    }
  };

  /** Quote Health Check runs before every quote. */
  const startQuote = () => setQuoteCheck(true);
  const continueToQuote = async () => {
    if (dirty && !(await save())) return;
    setQuoteCheck(false);
    onCreateQuote({ ...project, ...draft });
  };

  const infoField = (label: string, key: keyof Project, type = 'text') => (
    <div>
      <label className="pb-label">{label}</label>
      <input className="pb-input !py-2" type={type} value={(draft[key] as string) ?? ''} onChange={(e) => patch({ [key]: e.target.value } as Partial<Project>)} />
    </div>
  );

  return (
    <div className="p-5 md:p-10 pb-32 md:pb-28">
      {/* Header */}
      <button onClick={back} className="flex items-center gap-2 text-sm text-[#673AB7] hover:text-[#35235e] mb-4">
        <ArrowLeft className="w-4 h-4" /> โปรเจ็กต์ทั้งหมด
      </button>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">{draft.code} · {draft.projectType}</p>
          <h1 className="text-2xl md:text-[28px] font-semibold text-ink tracking-tight truncate">{draft.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={draft.status}
            onChange={(e) => patch({ status: e.target.value as ProjectStatus })}
            aria-label="สถานะงาน"
            className={`rounded-full px-3 py-2 text-sm font-medium outline-none ${statusPill(draft.status)}`}
          >
            {STATUSES.map(([id, t]) => <option key={id} value={id}>{t}</option>)}
          </select>
          <button onClick={startQuote} className="pb-btn-primary !py-2">
            <FileText className="w-4 h-4" /> สร้างใบเสนอราคา
          </button>
          <button onClick={remove} aria-label="ลบงาน" title="ลบงาน" className="p-2.5 rounded-full text-ink-muted hover:text-rose-600 hover:bg-rose-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Journey: one job, five steps, one set of data */}
      <nav className="no-scrollbar flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 mb-6" aria-label="ขั้นตอนของงาน">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStage(s.id)}
            aria-current={stage === s.id ? 'step' : undefined}
            className={`shrink-0 flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full transition-colors ${
              stage === s.id ? 'bg-white shadow-card text-ink' : 'text-ink-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            <span className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${stage === s.id ? 'bg-[#673AB7] text-white' : 'bg-[#F1F0F5]'}`}>{s.step}</span>
            <span className="text-sm font-medium whitespace-nowrap">{s.title}</span>
            <span className="hidden xl:inline text-xs text-ink-muted">{s.hint}</span>
          </button>
        ))}
      </nav>

      {stage === 'check' && (
        <div className="grid xl:grid-cols-[1.4fr_1fr] gap-5">
          <HealthPanel h={h} budget={draft.budget} />
          <div className="pb-card p-5 md:p-6 space-y-3 self-start">
            <h3 className="text-base md:text-lg font-semibold text-ink">ข้อมูลงาน</h3>
            {infoField('ชื่องาน', 'title')}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="pb-label">ประเภทงาน</label>
                <select className="pb-input !py-2" value={draft.projectType} onChange={(e) => patch({ projectType: e.target.value })}>
                  {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              {infoField('วันที่จัดงาน', 'eventDate', 'date')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {infoField('ลูกค้า', 'client')}
              {infoField('เบอร์โทร', 'phone', 'tel')}
            </div>
            {infoField('อีเมลลูกค้า', 'email', 'email')}
            <div>
              <label className="pb-label">หมายเหตุ</label>
              <textarea className="pb-input" rows={3} value={draft.notes} onChange={(e) => patch({ notes: e.target.value })} />
            </div>
            <button onClick={() => setStage('quote')} className="pb-btn-secondary w-full">แก้ต้นทุนและราคา →</button>
          </div>
        </div>
      )}
      {stage === 'quote' && <CostsStage draft={draft} patch={patch} rules={rules} h={h} lessons={lessons} />}
      {stage === 'simulate' && <SimulateStage draft={draft} job={job} rules={rules} patch={patch} />}
      {stage === 'deliver' && <DeliverStage draft={draft} job={job} rules={rules} patch={patch} />}
      {stage === 'review' && (
        <ReviewStage
          job={job}
          rules={rules}
          applied={draft.reviewApplied}
          onCheckFirst={() => setStage('deliver')}
          onApply={async () => {
            if (await save({ reviewApplied: true, status: 'completed' })) flash('บันทึกบทเรียนแล้ว งานถัดไประบบจะช่วยเตือนให้เผื่อต้นทุน');
          }}
        />
      )}

      {/* Unsaved changes bar */}
      {dirty && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 md:left-[calc(50%+8.5rem)] z-40 flex items-center gap-3 bg-ink text-white rounded-full pl-5 pr-2 py-2 shadow-soft-xl">
          <span className="text-sm whitespace-nowrap">มีการแก้ไขที่ยังไม่บันทึก</span>
          <button onClick={() => setDraft(project)} className="px-3 py-1.5 text-sm text-white/70 hover:text-white">ยกเลิก</button>
          <button onClick={() => save()} disabled={saving} className="px-4 py-1.5 rounded-full bg-white text-ink text-sm font-semibold disabled:opacity-60">
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      )}

      {/* Quote Health Check */}
      {quoteCheck && (
        <div className="fixed inset-0 z-50 bg-[#221A33]/40 backdrop-blur-[2px] flex items-center justify-center p-4" onClick={() => setQuoteCheck(false)}>
          <div className="bg-white rounded-[24px] shadow-soft-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-1">
              <h3 className="text-lg font-semibold text-ink">Quote Health Check</h3>
              <button onClick={() => setQuoteCheck(false)} aria-label="ปิด" className="p-1.5 rounded-full text-ink-muted hover:bg-[#F1F0F5]"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-ink-muted mb-4">ตรวจความเสี่ยงก่อนส่งใบเสนอราคา</p>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              {[
                ['ราคาขาย', h.price],
                ['ต้นทุนรวม', h.cost],
                ['กำไรคาดการณ์', h.profit],
              ].map(([l, v]) => (
                <div key={l as string} className="rounded-xl bg-[#F7F6FA] px-3 py-2">
                  <p className="text-xs text-ink-muted">{l as string}</p>
                  <p className="font-semibold text-ink">฿{Math.round(v as number).toLocaleString('th-TH')}</p>
                </div>
              ))}
              <div className="rounded-xl bg-[#F7F6FA] px-3 py-2">
                <p className="text-xs text-ink-muted">Margin</p>
                <p className="font-semibold text-ink">{h.margin.toFixed(1)}%</p>
              </div>
            </div>
            {h.risks.length > 0 && <p className="text-sm font-semibold text-rose-600 mb-2">ตรวจพบ {h.risks.length} จุดเสี่ยง</p>}
            <RiskList risks={h.risks} />
            <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              {h.risks.length > 0 && (
                <button onClick={continueToQuote} className="pb-btn-secondary">สร้างใบเสนอราคาต่อ</button>
              )}
              {h.risks.length > 0 ? (
                <button onClick={() => { setQuoteCheck(false); setStage('quote'); }} className="pb-btn-primary">แก้ไขก่อนส่ง</button>
              ) : (
                <button onClick={continueToQuote} className="pb-btn-primary">สร้างใบเสนอราคา</button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-3 rounded-full shadow-soft-xl z-50 animate-toast text-sm">{toast}</div>}
    </div>
  );
}
