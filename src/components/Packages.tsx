import React from 'react';
import { Check, Clock, Mail } from 'lucide-react';
import type { User } from '../lib/api';
import { CONTACT_EMAIL as PROFITBLOOM_SALES, PLANS } from '../landing/content';
import { planInfo, thaiDate, trialDaysLeft } from '../lib/plans';

interface PackagesProps {
  user: User;
}

export function Packages({ user }: PackagesProps) {
  const current = planInfo(user.plan);
  const shop = user.businessName.trim() || user.name;
  const daysLeft = trialDaysLeft(user);

  const contactLink = (plan: (typeof PLANS)[number]) => {
    const subject = `ขอใช้แพ็กเกจ ProfitBloom ${plan.name} - ${shop}`;
    const body = `สวัสดีครับ/ค่ะ ทีม ProfitBloom\n\nร้าน ${shop} (บัญชี ${user.email}) ใช้แพ็กเกจ ${current.name} อยู่ และต้องการใช้แพ็กเกจ ${plan.name} (${plan.price} ${plan.priceNote})\n\nขอบคุณครับ/ค่ะ`;
    return `mailto:${PROFITBLOOM_SALES}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="p-5 md:p-10 pb-28 md:pb-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-[28px] font-semibold text-ink tracking-tight">แพ็กเกจ</h1>
        <p className="text-sm text-ink-muted mt-1">แพ็กเกจ ProfitBloom ที่ร้านของคุณใช้งานอยู่</p>
      </div>

      {/* Current plan */}
      <div className="pb-card p-6 md:p-7 mb-8 max-w-5xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted mb-1">แพ็กเกจปัจจุบันของ {shop}</p>
          <p className="text-2xl font-semibold text-ink tracking-tight">{current.name}</p>
          {daysLeft !== null && user.trialEndsAt && (
            <p className={`mt-2 inline-flex items-center gap-1.5 text-sm font-medium ${daysLeft <= 7 ? 'text-rose-600' : 'text-[#673AB7]'}`}>
              <Clock className="w-4 h-4" />
              {daysLeft > 0 ? `ทดลองใช้ฟรีเหลือ ${daysLeft} วัน (ถึง ${thaiDate(user.trialEndsAt)})` : `ทดลองใช้ฟรีหมดแล้วเมื่อ ${thaiDate(user.trialEndsAt)}`}
            </p>
          )}
        </div>
        <a href={`mailto:${PROFITBLOOM_SALES}`} className="pb-btn-secondary self-start md:self-auto whitespace-nowrap shrink-0">
          <Mail className="w-4 h-4" />
          ติดต่อทีม ProfitBloom
        </a>
      </div>

      <h2 className="text-base md:text-lg font-semibold text-ink mb-4">แพ็กเกจทั้งหมด</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl items-stretch">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === current.id;
          return (
            <div key={plan.id} className={`pb-card p-6 flex flex-col ${isCurrent ? 'ring-2 ring-[#673AB7]/70' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                {isCurrent ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-[#673AB7] text-xs font-medium">ใช้งานอยู่</span>
                ) : plan.popular ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">ยอดนิยม</span>
                ) : null}
              </div>
              <p className="text-sm text-ink-muted mb-5 whitespace-pre-line min-h-[60px]">{plan.tagline}</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-3xl font-semibold text-ink tracking-tight">{plan.price}</span>
                <span className="text-sm text-ink-muted pb-1">{plan.priceNote}</span>
              </div>
              <p className="text-sm text-[#C09036] mb-6">{plan.priceSub}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-ink">
                    <Check className="w-4 h-4 text-[#673AB7] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <p className="text-center text-sm text-ink-muted py-2.5">แพ็กเกจที่คุณใช้อยู่</p>
              ) : plan.id === 'trial' ? (
                <p className="text-center text-sm text-ink-muted py-2.5">สำหรับร้านที่เพิ่งสมัคร</p>
              ) : (
                <a href={contactLink(plan)} className={`${plan.popular ? 'pb-btn-primary' : 'pb-btn-secondary'} w-full`}>
                  <Mail className="w-4 h-4" />
                  {user.plan === 'trial' ? `เลือก ${plan.name}` : `เปลี่ยนเป็น ${plan.name}`}
                </a>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-ink-muted max-w-5xl">
        กดเลือกแพ็กเกจแล้วระบบจะเปิดอีเมลถึงทีม ProfitBloom พร้อมข้อมูลร้านของคุณ ทีมงานจะติดต่อกลับเพื่อเปิดใช้แพ็กเกจให้
      </p>
    </div>
  );
}
