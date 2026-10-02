import React, { useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { AdminShop, api, timeAgo, User } from '../lib/api';
import { PLANS } from '../landing/content';
import { thaiDate, trialDaysLeft } from '../lib/plans';

interface AdminPageProps {
  user: User;
}

// plan names and yearly prices come from the public website, so they always match
const PLAN_LABEL = Object.fromEntries(PLANS.map((p) => [p.id, p.name])) as Record<User['plan'], string>;
const PLAN_PRICE = Object.fromEntries(PLANS.map((p) => [p.id, p.yearly])) as Record<User['plan'], number>;

const joined = (sqlite: string) =>
  new Date(sqlite.replace(' ', 'T') + 'Z').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

export function AdminPage({ user }: AdminPageProps) {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | User['plan'] | 'disabled'>('all');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.adminShops()
      .then(setShops)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const flash = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 3000);
  };

  const update = async (shop: AdminShop, body: { plan?: User['plan']; disabled?: boolean }) => {
    if (body.disabled === true && !window.confirm(`ระงับการใช้งานร้าน "${shop.businessName || shop.name}" ใช่หรือไม่?\nร้านจะถูกออกจากระบบทันทีและเข้าใช้งานไม่ได้จนกว่าจะเปิดใช้งานอีกครั้ง`)) return;
    setSavingId(shop.id);
    try {
      const saved = await api.adminUpdateShop(shop.id, body);
      setShops((list) => list.map((s) => (s.id === saved.id ? saved : s)));
      flash(
        body.plan
          ? `เปลี่ยน ${saved.businessName || saved.name} เป็น ${PLAN_LABEL[saved.plan]} แล้ว`
          : saved.disabled
            ? `ระงับ ${saved.businessName || saved.name} แล้ว`
            : `เปิดใช้งาน ${saved.businessName || saved.name} แล้ว`,
      );
    } catch (err) {
      flash((err as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  const active = shops.filter((s) => !s.disabled);
  const revenue = active.reduce((sum, s) => sum + PLAN_PRICE[s.plan], 0);
  const count = (f: typeof filter) =>
    f === 'all' ? shops.length : f === 'disabled' ? shops.filter((s) => s.disabled).length : shops.filter((s) => s.plan === f && !s.disabled).length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shops.filter((s) => {
      const matches = !q || [s.businessName, s.name, s.email, s.businessPhone].some((v) => v.toLowerCase().includes(q));
      const inFilter = filter === 'all' || (filter === 'disabled' ? s.disabled : s.plan === filter && !s.disabled);
      return matches && inFilter;
    });
  }, [shops, search, filter]);

  if (error) return <div className="p-10 text-rose-600">{error}</div>;

  return (
    <div className="p-5 md:p-10 pb-28 md:pb-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-[28px] font-semibold text-ink tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-[#673AB7]" />
          ผู้ดูแลระบบ
        </h1>
        <p className="text-sm text-ink-muted mt-1">ร้านค้าทั้งหมดที่ใช้ ProfitBloom จัดการแพ็กเกจและสถานะการใช้งาน</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: 'ร้านทั้งหมด', value: shops.length },
          { label: 'ใช้งานอยู่', value: active.length },
          { label: 'กำลังทดลองใช้ฟรี', value: active.filter((s) => s.plan === 'trial').length },
          { label: 'รายได้ต่อปี (Starter + Pro)', value: `฿${revenue.toLocaleString('th-TH')}` },
        ].map((card) => (
          <div key={card.label} className="pb-card p-4 md:p-5">
            <p className="text-sm text-ink-muted mb-2">{card.label}</p>
            <p className="text-xl md:text-2xl font-semibold text-ink tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {(['all', 'trial', 'starter', 'pro', 'disabled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`shrink-0 flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full text-sm transition-colors ${
              filter === f ? 'bg-white shadow-card text-ink font-medium' : 'text-ink-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            {f === 'all' ? 'ทั้งหมด' : f === 'disabled' ? 'ถูกระงับ' : PLAN_LABEL[f]}
            <span className={`min-w-6 px-1.5 py-0.5 rounded-full text-xs ${filter === f ? 'bg-violet-50 text-[#673AB7]' : 'bg-[#F1F0F5]'}`}>{count(f)}</span>
          </button>
        ))}
      </div>

      <div className="pb-card overflow-hidden">
        <div className="p-3 md:p-4 border-b border-line">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-5 h-5" />
            <input className="pb-input pl-10" placeholder="ค้นหาชื่อร้าน ชื่อผู้ใช้ อีเมล หรือเบอร์โทร" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading && <p className="p-8 text-center text-ink-muted">กำลังโหลด...</p>}
        {!loading && visible.length === 0 && <p className="p-8 text-center text-ink-muted">ไม่พบร้านที่ตรงกับเงื่อนไข</p>}

        <ul className="divide-y divide-line">
          {visible.map((shop) => {
            const isSelf = shop.id === user.id;
            return (
              <li key={shop.id} className={`p-4 md:px-5 flex flex-col lg:flex-row lg:items-center gap-4 ${shop.disabled ? 'bg-[#FBFAFD]' : ''}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0 ${shop.disabled ? 'bg-[#F1F0F5] text-ink-muted' : 'bg-violet-50 text-[#673AB7]'}`}>
                    {(shop.businessName || shop.name).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate flex items-center gap-2">
                      {shop.businessName || <span className="text-ink-muted">ยังไม่ตั้งชื่อร้าน</span>}
                      {shop.role === 'admin' && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">แอดมิน</span>}
                      {shop.disabled && <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs">ถูกระงับ</span>}
                    </p>
                    <p className="text-sm text-ink-muted truncate">
                      {shop.name} · {shop.email}
                    </p>
                    {shop.plan === 'trial' && shop.trialEndsAt && (() => {
                      const left = trialDaysLeft(shop);
                      return (
                        <p className={`text-xs mt-0.5 ${left === 0 ? 'text-rose-600' : 'text-[#673AB7]'}`}>
                          {left === 0 ? `ทดลองใช้หมดแล้ว (${thaiDate(shop.trialEndsAt)})` : `ทดลองใช้เหลือ ${left} วัน`}
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm lg:w-80 shrink-0">
                  <div>
                    <p className="text-ink-muted text-xs">โปรเจ็กต์</p>
                    <p className="font-medium text-ink">{shop.projects}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted text-xs">ใบเสนอราคา</p>
                    <p className="font-medium text-ink">{shop.quotes}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted text-xs">ใช้งานล่าสุด</p>
                    <p className="font-medium text-ink whitespace-nowrap">{shop.lastActiveAt ? timeAgo(shop.lastActiveAt) : `สมัคร ${joined(shop.createdAt)}`}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    aria-label={`แพ็กเกจของ ${shop.businessName || shop.name}`}
                    value={shop.plan}
                    disabled={savingId === shop.id}
                    onChange={(e) => update(shop, { plan: e.target.value as User['plan'] })}
                    className="pb-input !w-40 !py-2 disabled:opacity-60"
                  >
                    {(Object.keys(PLAN_LABEL) as User['plan'][]).map((p) => (
                      <option key={p} value={p}>{PLAN_LABEL[p]}</option>
                    ))}
                  </select>
                  {!isSelf && (
                    <button
                      onClick={() => update(shop, { disabled: !shop.disabled })}
                      disabled={savingId === shop.id}
                      className={`${shop.disabled ? 'pb-btn-secondary' : 'pb-btn-secondary !text-rose-600'} !py-2 whitespace-nowrap disabled:opacity-60`}
                    >
                      {shop.disabled ? 'เปิดใช้งาน' : 'ระงับ'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {notice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-3 rounded-full shadow-soft-xl z-50 animate-toast text-sm">{notice}</div>
      )}
    </div>
  );
}
