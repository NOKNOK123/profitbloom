import React, { useRef, useState } from 'react';
import { BarChart3, ChevronRight, Crown, ImagePlus, LogOut, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { api, User } from '../lib/api';
import { brandLogo, resizeLogo } from '../lib/brand';
import { DEFAULT_RULES, withDefaults, type Rules } from '../lib/decision';

interface AccountSettingsProps {
  user: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const inputClass = 'pb-input';

export function AccountSettings({ user, onUserUpdated, onLogout, onNavigate }: AccountSettingsProps) {
  const [form, setForm] = useState({
    name: user.name,
    businessName: user.businessName,
    businessAddress: user.businessAddress,
    businessPhone: user.businessPhone,
    businessTaxId: user.businessTaxId,
    businessLogo: user.businessLogo,
  });
  const fileInput = useRef<HTMLInputElement>(null);
  const [rules, setRules] = useState<Rules>(withDefaults(user.rules));

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const businessLogo = await resizeLogo(file);
      setForm((f) => ({ ...f, businessLogo }));
      setMessage(null);
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    }
  };
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { user: updated } = await api.updateAccount({ ...form, rules, ...(newPassword ? { currentPassword, newPassword } : {}) });
      onUserUpdated(updated);
      setCurrentPassword('');
      setNewPassword('');
      setMessage({ ok: true, text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="p-5 md:p-10 pb-28 md:pb-10 max-w-3xl">
        <h1 className="text-2xl md:text-[28px] font-semibold text-ink tracking-tight mb-1">ตั้งค่า</h1>
        <p className="text-ink-muted mb-8">ข้อมูลร้าน โลโก้ และบัญชีของคุณ</p>

        {/* on phones these pages aren't in the bottom bar, so reach them from here */}
        <div className="md:hidden pb-card mb-6 divide-y divide-line overflow-hidden">
          {[
            { id: 'reports', label: 'รายงาน', icon: BarChart3 },
            { id: 'subscription', label: 'แพ็กเกจของร้าน', icon: Crown },
            ...(user.role === 'admin' ? [{ id: 'admin', label: 'ผู้ดูแลระบบ', icon: ShieldCheck }] : []),
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => onNavigate(id)} className="w-full flex items-center gap-3 px-5 py-4 text-left text-ink">
              <Icon className="w-5 h-5 text-[#673AB7]" />
              <span className="flex-1 font-medium">{label}</span>
              <ChevronRight className="w-4 h-4 text-ink-muted" />
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="pb-card p-6 md:p-8 space-y-4">
            <div>
              <h3 className="text-base md:text-lg text-ink font-semibold">ร้าน / บริษัท</h3>
              <p className="text-sm text-ink-muted">ชื่อและโลโก้นี้จะแสดงแทน ProfitBloom ในเมนู และบนใบเสนอราคาที่ส่งให้ลูกค้า</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 py-2">
              {/* live preview of how the sidebar header will look */}
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-gradient-to-br from-[#7C4DDB] to-[#35235e] text-white sm:w-64 shrink-0">
                <div className="w-11 h-11 rounded-xl bg-white/95 p-1 shrink-0">
                  <img src={form.businessLogo || brandLogo({ ...user, businessLogo: '' })} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{form.businessName.trim() || 'ProfitBloom'}</p>
                  <p className="text-xs text-white/65">ตัวอย่างในเมนู</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoFile} />
                <button type="button" onClick={() => fileInput.current?.click()} className="pb-btn-secondary">
                  <ImagePlus className="w-4 h-4" />
                  {form.businessLogo ? 'เปลี่ยนโลโก้' : 'อัปโหลดโลโก้'}
                </button>
                {form.businessLogo && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, businessLogo: '' }))} className="pb-btn-secondary !text-rose-600">
                    <Trash2 className="w-4 h-4" />
                    ใช้โลโก้ ProfitBloom
                  </button>
                )}
                <p className="w-full text-xs text-ink-muted">PNG, JPG หรือ WebP ภาพสี่เหลี่ยมจัตุรัสพื้นใสจะดูดีที่สุด</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="pb-label">ชื่อร้าน / บริษัท (แสดงแทน ProfitBloom)</label>
                <input className={inputClass} value={form.businessName} onChange={set('businessName')} placeholder="เช่น ร้านดอกไม้บลูม" />
              </div>
              <div className="md:col-span-2">
                <label className="pb-label">ที่อยู่</label>
                <textarea className={inputClass} rows={2} value={form.businessAddress} onChange={set('businessAddress')} />
              </div>
              <div>
                <label className="pb-label">เบอร์โทรศัพท์</label>
                <input className={inputClass} value={form.businessPhone} onChange={set('businessPhone')} />
              </div>
              <div>
                <label className="pb-label">เลขประจำตัวผู้เสียภาษี</label>
                <input className={inputClass} value={form.businessTaxId} onChange={set('businessTaxId')} />
              </div>
            </div>
          </div>

          <div className="pb-card p-6 md:p-8 space-y-4">
            <div>
              <h3 className="text-base md:text-lg text-ink font-semibold">กติกาธุรกิจ</h3>
              <p className="text-sm text-ink-muted">เกณฑ์ที่ระบบใช้ตัดสินว่างานไหนปลอดภัยหรือเสี่ยง — ปรับให้ตรงกับร้านของคุณ</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {([
                ['highRiskMargin', 'เสี่ยงสูง เมื่อ Margin ต่ำกว่า (%)', 'งานจะถูกจัดเป็น High Risk'],
                ['minMargin', 'Margin ขั้นต่ำที่รับได้ (%)', 'ใช้เป็นราคาต่ำสุดที่แนะนำ'],
                ['goodMargin', 'Margin ที่ดี (%)', 'ใช้เป็นราคาสูงสุดที่แนะนำ'],
                ['depositPct', 'มัดจำมาตรฐาน (%)', 'ค่าเริ่มต้นของงานใหม่'],
                ['dailyWage', 'ค่าแรงต่อคนต่อวัน (บาท)', 'ใช้ในเช็คก่อนรับงานและการจำลอง'],
                ['vehicleCost', 'ค่ารถต่อคัน (บาท)', 'ใช้ในการจำลองสถานการณ์'],
                ['laborOverrunPct', 'เตือนค่าแรงเกินงบ เมื่อเกิน (%)', 'Labor Overrun หลังจบงาน'],
              ] as Array<[keyof Rules, string, string]>).map(([k, label, hint]) => (
                <div key={k}>
                  <label className="pb-label">{label}</label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={rules[k]}
                    onChange={(e) => setRules({ ...rules, [k]: e.target.value === '' ? 0 : Number(e.target.value) })}
                  />
                  <p className="text-xs text-ink-muted mt-1">{hint}</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setRules(DEFAULT_RULES)} className="text-sm text-[#5A42C6] font-medium hover:underline">
              ใช้ค่าเริ่มต้นของ ProfitBloom
            </button>
          </div>

          <div className="pb-card p-6 md:p-8 space-y-4">
            <h3 className="text-base md:text-lg text-ink font-semibold">บัญชีผู้ใช้</h3>
            <div>
              <label className="pb-label">ชื่อ</label>
              <input className={inputClass} value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="pb-label">อีเมล</label>
              <input className={`${inputClass} bg-[#F7F6FA] text-ink-muted`} value={user.email} disabled />
            </div>
          </div>

          <div className="pb-card p-6 md:p-8 space-y-4">
            <h3 className="text-base md:text-lg text-ink font-semibold">เปลี่ยนรหัสผ่าน</h3>
            <p className="text-sm text-ink-muted">เว้นว่างไว้หากไม่ต้องการเปลี่ยน</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="pb-label">รหัสผ่านปัจจุบัน</label>
                <input className={inputClass} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
              </div>
              <div>
                <label className="pb-label">รหัสผ่านใหม่</label>
                <input className={inputClass} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} autoComplete="new-password" />
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg border text-sm ${message.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="pb-btn-primary flex-1 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
