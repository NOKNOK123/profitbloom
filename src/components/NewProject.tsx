import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { api, type Project, type User } from '../lib/api';
import { health, learnings, marginToMarkup } from '../lib/decision';
import { rulesOf, toJob } from '../lib/job';
import { blankItem, CostsStage } from './job/CostsStage';
import { HealthPanel } from './job/HealthPanel';

interface NewProjectProps {
  user: User;
  onCreated: (project: Project) => void;
}

const PROJECT_TYPES = ['งานแต่งงาน', 'งานหมั้น', 'งานวันเกิด', 'งานบวช', 'งานเปิดร้าน', 'อื่นๆ'];

const steps = [
  { id: 1, title: 'ข้อมูลงาน' },
  { id: 2, title: 'ต้นทุนและราคา' },
  { id: 3, title: 'เช็คสุขภาพงาน' },
];

/** New job: the same building blocks as the job workspace, so nothing has to be typed twice later. */
export function NewProject({ user, onCreated }: NewProjectProps) {
  const rules = useMemo(() => rulesOf(user), [user]);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [history, setHistory] = useState<Project[]>([]);
  const [draft, setDraft] = useState<Project>(() => ({
    id: 'new',
    code: '',
    title: '',
    projectType: 'งานแต่งงาน',
    client: '',
    phone: '',
    email: '',
    eventDate: '',
    budget: 0,
    notes: '',
    status: 'draft',
    statusText: 'ร่าง',
    createdDate: '',
    profitMargin: marginToMarkup(rules.goodMargin),
    depositPct: rules.depositPct,
    setupDays: 1,
    eventDays: 1,
    laborDays: null,
    teamSize: null,
    ownerLabor: null,
    teardown: null,
    reviewApplied: false,
    reviewedAt: null,
    costItems: [
      { ...blankItem('material'), name: 'ดอกไม้และวัสดุ' },
      { ...blankItem('labor'), name: 'ค่าแรงทีมงาน' },
      { ...blankItem('transport'), name: 'ขนส่ง' },
    ],
  }));

  useEffect(() => {
    api.projects().then(setHistory).catch(() => {});
  }, []);

  const patch = (p: Partial<Project>) => setDraft((d) => ({ ...d, ...p }));
  const job = useMemo(() => toJob(draft), [draft]);
  const h = useMemo(() => health(job, rules), [job, rules]);
  const lessons = useMemo(() => learnings(history.filter((p) => p.reviewApplied).map(toJob)), [history]);
  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(''), 3000);
  };

  const missing = () => {
    if (!draft.title.trim()) return 'กรุณากรอกชื่องาน';
    if (!draft.eventDate) return 'กรุณาเลือกวันที่จัดงาน';
    return '';
  };
  const next = () => {
    const m = step === 1 ? missing() : '';
    if (m) return flash(m);
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const save = async () => {
    const m = missing();
    if (m) {
      setStep(1);
      return flash(m);
    }
    setSaving(true);
    try {
      const { id, code, statusText, createdDate, ...body } = draft;
      const created = await api.createProject({
        ...body,
        costItems: draft.costItems.filter((i) => i.name.trim() || i.quantity * i.price > 0),
      });
      onCreated(created);
    } catch (err) {
      flash((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof Project, type = 'text', placeholder = '') => (
    <div>
      <label className="pb-label">{label}</label>
      <input className="pb-input" type={type} placeholder={placeholder} value={(draft[key] as string) ?? ''} onChange={(e) => patch({ [key]: e.target.value } as Partial<Project>)} />
    </div>
  );

  return (
    <div className="p-5 md:p-10 pb-28 md:pb-10">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-[28px] font-semibold text-ink tracking-tight mb-1">สร้างโปรเจ็กต์ใหม่</h2>
        <p className="text-sm md:text-base text-ink-muted">ใส่ข้อมูลงานและต้นทุน ระบบจะเช็คสุขภาพกำไรให้ก่อนบันทึก</p>
      </div>

      <div className="mb-6 md:mb-8 px-1 flex items-center">
        {steps.map((s, index) => (
          <div key={s.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-medium ${step >= s.id ? 'bg-[#673AB7] text-white' : 'bg-[#F1F0F5] text-ink-muted'}`}>{s.id}</div>
            <span className={`ml-2.5 text-sm font-medium whitespace-nowrap ${step >= s.id ? 'text-ink' : 'text-ink-muted'}`}>{s.title}</span>
            {index < steps.length - 1 && <div className={`hidden sm:block flex-1 h-px mx-3 ${step > s.id ? 'bg-[#673AB7]' : 'bg-line'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="pb-card p-5 md:p-8 grid md:grid-cols-2 gap-4">
          {field('ชื่องาน *', 'title', 'text', 'เช่น งานแต่งงาน - คุณสมชาย & คุณมาลี')}
          <div>
            <label className="pb-label">ประเภทงาน *</label>
            <select className="pb-input" value={draft.projectType} onChange={(e) => patch({ projectType: e.target.value })}>
              {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          {field('ชื่อลูกค้า', 'client', 'text', 'เช่น คุณสมชาย')}
          {field('เบอร์โทรศัพท์', 'phone', 'tel', 'เช่น 081-234-5678')}
          {field('อีเมล', 'email', 'email', 'เช่น customer@email.com')}
          {field('วันที่จัดงาน *', 'eventDate', 'date')}
          <div className="md:col-span-2">
            <label className="pb-label">หมายเหตุ</label>
            <textarea className="pb-input" rows={3} value={draft.notes} placeholder="เช่น สีธีมม่วง-ทอง, งานแต่งงานแบบไทยประยุกต์" onChange={(e) => patch({ notes: e.target.value })} />
          </div>
        </div>
      )}
      {step === 2 && <CostsStage draft={draft} patch={patch} rules={rules} h={h} lessons={lessons} />}
      {step === 3 && <HealthPanel h={h} budget={draft.budget} />}

      <div className="mt-6 flex flex-col-reverse md:flex-row gap-3">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="pb-btn-secondary">
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </button>
        )}
        {step < 3 ? (
          <button onClick={next} className="pb-btn-primary flex-1">
            ถัดไป <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={save} disabled={saving} className="pb-btn-primary flex-1 disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึกโปรเจ็กต์'}
          </button>
        )}
      </div>

      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-3 rounded-full shadow-soft-xl z-50 animate-toast text-sm">{toast}</div>}
    </div>
  );
}
