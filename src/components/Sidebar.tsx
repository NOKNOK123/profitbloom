import React from 'react';
import { ClipboardCheck, Home, FolderOpen, Plus, FileText, BarChart3, Settings, Crown, LogOut, ShieldCheck } from 'lucide-react';
import type { User } from '../lib/api';
import { brandLogo, brandName } from '../lib/brand';
import { planName, trialDaysLeft } from '../lib/plans';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  user: User;
  onLogout: () => void;
}

const mainItems = [
  { id: 'dashboard', label: 'หน้าหลัก', icon: Home },
  { id: 'quick-check', label: 'เช็คก่อนรับงาน', icon: ClipboardCheck },
  { id: 'projects', label: 'โปรเจ็กต์', icon: FolderOpen },
  { id: 'quotes', label: 'ใบเสนอราคา', icon: FileText },
  { id: 'reports', label: 'รายงาน', icon: BarChart3 },
  { id: 'settings', label: 'ตั้งค่า', icon: Settings },
];

const extraItems = [{ id: 'subscription', label: 'แพ็กเกจ', icon: Crown }];
const adminItem = { id: 'admin', label: 'ผู้ดูแลระบบ', icon: ShieldCheck };

export function Sidebar({ activeNav, setActiveNav, user, onLogout }: SidebarProps) {
  const isActive = (id: string) =>
    activeNav === id || (id === 'quotes' && ['quotes-all', 'quotes-new'].includes(activeNav));

  const item = ({ id, label, icon: Icon }: (typeof mainItems)[number], subtle = false) => {
    const active = isActive(id);
    return (
      <li key={id}>
        <button
          onClick={() => setActiveNav(id)}
          aria-current={active ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-colors ${
            active ? 'bg-white shadow-card text-ink font-medium' : 'text-white/75 hover:text-white hover:bg-white/10'
          } ${subtle ? 'text-[13px]' : 'text-sm'}`}
        >
          <Icon className={`w-[18px] h-[18px] ${active ? 'text-[#673AB7]' : ''}`} />
          {label}
        </button>
      </li>
    );
  };

  return (
    <div className="relative flex flex-col h-full w-full rounded-[28px] p-4 text-white overflow-hidden bg-gradient-to-b from-[#7C4DDB] via-[#673AB7] to-[#35235e] shadow-[0_1px_2px_rgba(53,35,94,0.25),0_20px_48px_-16px_rgba(103,58,183,0.55)]">
      {/* soft light at the top edge for depth */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 w-56 h-56 rounded-full bg-white/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#eab308]/15 blur-3xl" />

      <div className="relative flex items-center gap-3 px-2 pt-2 mb-7">
        <div className="w-10 h-10 rounded-xl bg-white/95 p-1 shadow-soft shrink-0">
          <img src={brandLogo(user)} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold leading-tight truncate" title={brandName(user)}>{brandName(user)}</p>
          <p className="text-xs text-white/65 truncate">
            {planName(user.plan)}
            {trialDaysLeft(user) !== null && ` · เหลือ ${trialDaysLeft(user)} วัน`}
          </p>
        </div>
      </div>

      <button
        onClick={() => setActiveNav('new-project')}
        className="relative w-full mb-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-[#eab308] text-[#35235e] hover:bg-[#f2c230] transition-colors shadow-[0_6px_16px_-6px_rgba(234,179,8,0.7)]"
      >
        <Plus className="w-4 h-4" />
        สร้างโปรเจ็กต์
      </button>

      <nav className="relative flex-1">
        <ul className="space-y-1">{mainItems.map((i) => item(i))}</ul>
        <ul className="space-y-1 mt-6 pt-6 border-t border-white/15">{[...extraItems, ...(user.role === 'admin' ? [adminItem] : [])].map((i) => item(i, true))}</ul>
      </nav>

      <div className="relative flex items-center gap-3 p-2 rounded-2xl bg-white/10">
        <div className="w-9 h-9 rounded-full bg-[#eab308] text-[#35235e] text-sm font-semibold flex items-center justify-center shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-white/60 truncate">{user.email}</p>
        </div>
        <button onClick={onLogout} title="ออกจากระบบ" aria-label="ออกจากระบบ" className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
