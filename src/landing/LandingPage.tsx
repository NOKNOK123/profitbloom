import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ClipboardCheck,
  Gauge,
  ShieldCheck,
  SlidersHorizontal,
  Calendar,
  Check,
  FileText,
  Facebook,
  FolderCheck,
  Instagram,
  Linkedin,
  Menu,
  Play,
  Star,
  Store,
  TrendingUp,
  Users,
  X,
  Youtube,
} from 'lucide-react';
import { CONTACT_EMAIL, HERO_BADGES, LINKS, PLANS, SOCIAL_LINKS, STATS, TESTIMONIALS } from './content';

interface LandingPageProps {
  isLoggedIn: boolean;
  onNavigate: (path: '/login' | '/signup' | '/app') => void;
}

// colours sampled from the design file
const VIOLET = '#7E66F6';
const PLUM = '#7842AE';
const GOLD = '#C09036';
const OLIVE = '#5A7E48';

// one layout system for every section
const CONTAINER = 'max-w-[1200px] mx-auto px-6';
const SECTION = 'py-20 md:py-28';
const H2 = 'text-[30px] md:text-[44px] leading-[1.2] font-bold tracking-tight';
const LEAD = 'text-base md:text-lg text-[#5B566D] leading-relaxed';
const CARD = 'bg-white rounded-[24px] border border-[#EFEBFA] shadow-[0_1px_2px_rgba(34,26,51,0.04),0_16px_40px_-16px_rgba(34,26,51,0.16)]';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white bg-gradient-to-b from-[#8A72F0] to-[#5A42C6] shadow-[0_10px_24px_-8px_rgba(90,66,198,0.7)] hover:brightness-110 transition';
const btnGold =
  'inline-flex items-center justify-center rounded-full px-7 py-3.5 font-semibold text-white bg-[#C09036] hover:bg-[#A97D2C] transition';

const contactHref = `mailto:${CONTACT_EMAIL}`;

const gradientText = 'bg-gradient-to-b from-[#8B73F7] to-[#6A4FE6] bg-clip-text text-transparent';

/** Two-tone section title: violet first part, gold second part. */
function Title({ a, b, center = true }: { a: string; b?: string; center?: boolean }) {
  return (
    <h2 className={`${H2} ${center ? 'text-center' : ''}`}>
      <span className={gradientText}>{a}</span>
      {b && <span style={{ color: GOLD }}> {b}</span>}
    </h2>
  );
}

/** A phone showing what the ProfitBloom app looks like (HTML, so it stays sharp at any size). */
function AppPhone({ className = '' }: { className?: string }) {
  const projects = [
    { title: 'งานแต่ง คุณนิภา', date: '20 ต.ค.', progress: 60, color: '#eab308' },
    { title: 'งานหมั้น คุณวีรชัย', date: '2 พ.ย.', progress: 25, color: '#673AB7' },
  ];
  return (
    <div className={`relative rounded-[46px] bg-[#1b1b1f] p-[10px] shadow-[0_40px_80px_-30px_rgba(34,26,51,0.55)] ${className}`}>
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1b1b1f] rounded-b-2xl z-10" />
      <div className="rounded-[37px] overflow-hidden bg-gradient-to-b from-[#EEE9FF] to-white h-full">
        <div className="flex justify-between px-6 pt-3 text-[11px] font-semibold text-[#221A33]">
          <span>9:41</span>
          <span className="tracking-tighter">●●● ▮</span>
        </div>
        <div className="px-5 pt-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-[#5B566D]">สวัสดีตอนเย็น</p>
              <p className="text-lg font-bold text-[#221A33]">คุณมาลี</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#eab308] text-white font-bold flex items-center justify-center">ม</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              ['ยอดขายเดือนนี้', '฿158,250'],
              ['กำไรสุทธิ', '฿45,680'],
            ].map(([label, value]) => (
              <div key={label} className="bg-white rounded-2xl p-3 shadow-[0_6px_16px_-10px_rgba(34,26,51,0.25)]">
                <p className="text-[10px] text-[#5B566D]">{label}</p>
                <p className="text-sm font-bold text-[#221A33]">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-[#221A33] mb-2">โปรเจ็กต์ของฉัน</p>
          <div className="space-y-2 mb-5">
            {projects.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-3 shadow-[0_6px_16px_-10px_rgba(34,26,51,0.25)]">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#221A33]">{p.title}</span>
                  <span className="text-[#5B566D]">{p.date}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#F1F0F5]">
                  <div className="h-1.5 rounded-full" style={{ width: `${p.progress}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-[#221A33] mb-2">งานวันนี้</p>
          {['ส่งใบเสนอราคา QT-2026-014', 'สั่งดอกกุหลาบขาว 100 ดอก', 'ยืนยันวันจัดงานกับลูกค้า'].map((t, i) => (
            <div key={t} className="flex items-center gap-2 py-1.5 text-xs text-[#221A33]">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-[#22c55e] text-white' : 'border border-[#BDB8CC]'}`}>
                {i === 0 && <Check className="w-3 h-3" />}
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl px-4 py-3 shadow-[0_16px_40px_-16px_rgba(34,26,51,0.35)] flex items-center gap-3 ${className}`}>
      <img src="/landing/review-avatar.webp" alt="" className="w-9 h-9 rounded-full object-cover" />
      <div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
          ))}
        </div>
        <p className="text-xs font-semibold text-[#221A33] mt-0.5 whitespace-nowrap">{HERO_BADGES.reviews} Customer Review</p>
      </div>
    </div>
  );
}

const STAT_ICONS = [Store, TrendingUp, Users, FolderCheck];

export function LandingPage({ isLoggedIn, onNavigate }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'ProfitBloom – รู้ก่อนรับงาน ว่างานนี้จะเหลือกำไรจริงเท่าไร';
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const signup = () => onNavigate(isLoggedIn ? '/app' : '/signup');

  const socials = [
    { href: SOCIAL_LINKS.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { href: SOCIAL_LINKS.facebook, icon: Facebook, label: 'Facebook' },
    { href: SOCIAL_LINKS.instagram, icon: Instagram, label: 'Instagram' },
    { href: SOCIAL_LINKS.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((s) => s.href);

  return (
    <div className="bg-white text-[#221A33] overflow-x-hidden">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#F1EEF8]">
        <div className={`${CONTAINER} h-[76px] flex items-center justify-between`}>
          <button onClick={toTop} aria-label="ProfitBloom หน้าแรก" className="flex items-center gap-2.5">
            <img src="/landing/logo.png" alt="" className="h-10 w-auto" />
            <span className="text-lg font-bold text-[#35235e] hidden sm:inline">ProfitBloom</span>
          </button>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={toTop} className="text-[15px] text-[#221A33] hover:text-[#5A42C6]">Home</button>
            <button onClick={() => scrollTo('about')} className="text-[15px] text-[#221A33] hover:text-[#5A42C6]">About Us</button>
            <button onClick={() => scrollTo('features')} className="text-[15px] text-[#221A33] hover:text-[#5A42C6]">Features</button>
            <button onClick={() => scrollTo('pricing')} className="text-[15px] text-[#221A33] hover:text-[#5A42C6]">Pricing</button>
            {isLoggedIn ? (
              <button onClick={() => onNavigate('/app')} className={`${btnPrimary} !px-8 !py-2.5`}>เข้าใช้งาน</button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => onNavigate('/login')} className={`${btnPrimary} !px-8 !py-2.5`}>Login</button>
                <button onClick={() => onNavigate('/signup')} className="rounded-full px-7 py-2.5 border-[1.5px] border-[#7E66F6] text-[#5A42C6] font-semibold hover:bg-[#F4F1FE] transition">
                  Sign Up
                </button>
              </div>
            )}
          </nav>
          <button className="md:hidden p-2 -mr-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="เมนู" aria-expanded={menuOpen}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 pb-5 flex flex-col gap-1 bg-white border-t border-[#F1EEF8]">
            {[
              ['about', 'About Us'],
              ['features', 'Features'],
              ['pricing', 'Pricing'],
            ].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left py-3 border-b border-[#F4F1FA]">{label}</button>
            ))}
            {isLoggedIn ? (
              <button onClick={() => onNavigate('/app')} className={`${btnPrimary} mt-3`}>เข้าใช้งาน</button>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button onClick={() => onNavigate('/login')} className={btnPrimary}>Login</button>
                <button onClick={() => onNavigate('/signup')} className="rounded-full py-3 border-[1.5px] border-[#7E66F6] text-[#5A42C6] font-semibold">Sign Up</button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_78%_45%,#E4DAFF_0%,#F4F0FF_45%,#ffffff_78%)]" />
        <div className={`relative ${CONTAINER} pt-14 md:pt-20 pb-28 md:pb-36 grid lg:grid-cols-[1fr_1.12fr] gap-12 lg:gap-8 items-center`}>
          <div className="text-center lg:text-left">
            <h1 className="text-[clamp(30px,9vw,40px)] sm:text-[50px] xl:text-[60px] leading-[1.15] font-bold tracking-tight whitespace-nowrap" style={{ color: PLUM }}>
              รู้ก่อนรับงาน
            </h1>
            <p className="mt-3 text-[22px] sm:text-[28px] xl:text-[34px] leading-snug font-semibold" style={{ color: PLUM }}>
              ว่างานนี้จะเหลือ
              <br />
              กำไรจริงเท่าไร
            </p>
            <p className={`mt-7 max-w-[470px] mx-auto lg:mx-0 ${LEAD}`}>
              <span className="font-semibold text-[#35235e]">ProfitBloom</span> ระบบช่วยตัดสินใจก่อนรับงาน สำหรับธุรกิจดอกไม้ Wedding และ Event —
              เช็คความเสี่ยงก่อนเสนอราคา ลองลดราคาก่อนตอบลูกค้า และสรุปกำไรจริงหลังจบงาน
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
              <button onClick={signup} className={`${btnPrimary} !px-9`}>ทดลองใช้ฟรี</button>
              <button onClick={() => scrollTo('features')} className="group flex items-center gap-3 font-medium text-[#5B566D] hover:text-[#221A33]">
                <span className="w-12 h-12 rounded-full bg-[#D39A2C] text-white flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(211,154,44,0.8)] group-hover:scale-105 transition">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </span>
                ดูวิธีการทำงาน
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[640px] lg:max-w-none">
            <img src="/landing/hero-tablet.webp" alt="หน้าจอ Dashboard ของ ProfitBloom บนแท็บเล็ต" className="w-full drop-shadow-[0_40px_60px_rgba(53,35,94,0.3)]" />
            <div className="absolute -top-[2%] right-[0%] bg-white rounded-2xl px-4 py-3 shadow-[0_16px_40px_-16px_rgba(34,26,51,0.35)]">
              <p className="text-xs text-[#5B566D]">โปรเจคสำเร็จ</p>
              <div className="flex items-center gap-3">
                <p className="text-xl font-bold text-[#221A33]">{HERO_BADGES.projectsDone}</p>
                <svg width="46" height="14" viewBox="0 0 46 14" fill="none" aria-hidden>
                  <path d="M1 9c6-6 10 4 16-1s9-7 15-3 8 3 13-3" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <ReviewBadge className="absolute top-[44%] -left-[4%] hidden sm:flex" />
            <div className="absolute -bottom-[4%] right-[6%] w-28 md:w-32 rounded-2xl p-4 text-white bg-gradient-to-br from-[#8A72F0] to-[#5A42C6] shadow-[0_20px_40px_-14px_rgba(90,66,198,0.7)]">
              <p className="text-sm font-semibold mb-2">ยอดขาย</p>
              <div className="flex items-end gap-2 h-10 md:h-12">
                {[45, 85, 60, 95].map((h, i) => (
                  <span key={i} className="w-2.5 rounded-full bg-white/90" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Experience + stats: one panel overlapping the hero ---------- */}
      <section className={`relative z-10 -mt-16 md:-mt-20 ${CONTAINER}`}>
        <div className={`${CARD} p-7 md:p-10 grid lg:grid-cols-[0.9fr_1.6fr] gap-8 lg:gap-12 items-center`}>
          <div>
            <p className="text-xl md:text-2xl font-bold leading-snug" style={{ color: OLIVE }}>
              จากประสบการณ์จริงกว่า 20 ปี ในวงการดอกไม้และงานแต่ง
            </p>
            <p className="mt-3 text-base md:text-lg font-semibold leading-relaxed" style={{ color: VIOLET }}>
              เราเข้าใจดีว่าการคำนวณราคาที่ “ไม่แม่นยำ” กำลังทำให้คุณเสียกำไรโดยไม่รู้ตัว
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-[#EFEBFA]">
            {STATS.map((s, i) => {
              const Icon = STAT_ICONS[i % STAT_ICONS.length];
              return (
                <div key={s.value} className="md:px-6 md:first:pl-0 md:last:pr-0">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${i % 2 ? 'bg-amber-50 text-[#C09036]' : 'bg-[#F1EDFE] text-[#7E66F6]'}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <p className="mt-4 text-[28px] xl:text-[32px] leading-none font-bold whitespace-nowrap" style={{ color: GOLD }}>{s.value}</p>
                  <p className="mt-2 text-sm text-[#5B566D] leading-relaxed">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- What is ---------- */}
      <section id="about" className={`${SECTION} scroll-mt-20`}>
        <div className={`${CONTAINER} text-center`}>
          <Title a="What is" b="ProfitBloom Program?" />
          <p className={`mt-6 max-w-[780px] mx-auto ${LEAD}`}>
            ProfitBloom คือเครื่องมือที่พัฒนาขึ้นเพื่อช่วยธุรกิจ ดอกไม้และจัดงาน คำนวณต้นทุน ตั้งราคาขาย และเพิ่มกำไรได้ง่าย ๆ
            โดยไม่ต้องมีพื้นฐานทางบัญชี ช่วยบริหารจัดการร้านดอกไม้อย่างมีแผนงานและมีมาตรฐานแบบมืออาชีพ
          </p>
          <div className="mt-12 grid md:grid-cols-2 gap-6 md:gap-8">
            {[
              { img: '/landing/for-owners.webp', title: 'สำหรับผู้ประกอบการ', text: 'ร้านที่เปิดอยู่แล้ว อยากรู้กำไรจริงของทุกงาน', cta: 'เริ่มใช้งานเลย', action: signup, outline: true, tint: 'from-[#221A33]/60 via-[#221A33]/20 to-transparent' },
              { img: '/landing/for-starters.webp', title: 'สำหรับผู้เริ่มต้น', text: 'เพิ่งเริ่มรับงาน อยากตั้งราคาให้ถูกตั้งแต่วันแรก', cta: 'ดูฟีเจอร์ทั้งหมด', action: () => scrollTo('features'), outline: false, tint: 'from-[#4A3410]/70 via-[#B4892F]/25 to-transparent' },
            ].map((c) => (
              <div key={c.title} className="group relative h-[300px] md:h-[340px] rounded-[24px] overflow-hidden shadow-[0_24px_48px_-24px_rgba(34,26,51,0.45)] text-left">
                <img src={c.img} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-t ${c.tint}`} />
                <div className="relative h-full flex flex-col justify-end p-7 md:p-8">
                  <p className="text-2xl md:text-[28px] font-bold text-white">{c.title}</p>
                  <p className="mt-1 text-white/85">{c.text}</p>
                  <button
                    onClick={c.action}
                    className={`mt-5 self-start ${c.outline ? 'rounded-full px-6 py-3 bg-white text-[#5A42C6] font-semibold hover:bg-[#F4F1FE] transition' : `${btnPrimary} !px-6 !py-3`}`}
                  >
                    {c.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Before / After ---------- */}
      <section className={`relative ${SECTION} bg-[#FAF8FF]`}>
        <div className={`${CONTAINER} text-center`}>
          <h2 className={H2}>
            <span style={{ color: VIOLET }}>Before After</span> <span style={{ color: GOLD }}>Transformation</span>
          </h2>
          <p className={`mt-4 ${LEAD}`}>ดูความแตกต่างก่อนและหลังใช้ ProfitBloom</p>
          <div className="mt-12 grid md:grid-cols-2 gap-6 md:gap-8 max-w-[1000px] mx-auto text-left">
            <div className={`${CARD} p-7 md:p-9`}>
              <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold">ปัญหาที่พบ</span>
              <p className="mt-3 text-2xl font-bold" style={{ color: GOLD }}>ก่อนใช้ ProfitBloom</p>
              <ul className="mt-6 space-y-4">
                {['ใช้เวลา 30–60 นาทีคำนวณราคาต่อหนึ่งงาน', 'คลาดเคลื่อนง่าย เพราะแก้สูตร/ตัวเลขเอง', 'ไม่รู้ว่าควรตั้งราคาเท่าไหร่ถึงจะคุ้ม', 'ไม่มีข้อมูลย้อนหลังเป็นระบบ', 'ตอบลูกค้าช้า พลาดโอกาสปิดดีล'].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-[#5B566D]">
                    <span className="w-6 h-6 rounded-full bg-rose-50 text-[#EF4444] flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5" strokeWidth={3} /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] p-7 md:p-9 bg-gradient-to-br from-[#F3EFFF] to-[#E7DFFF] border-[1.5px] border-[#A895F7] shadow-[0_24px_48px_-24px_rgba(90,66,198,0.45)]">
              <span className="inline-block px-3 py-1 rounded-full bg-[#7E66F6] text-white text-xs font-semibold">โซลูชัน</span>
              <p className="mt-3 text-2xl font-bold text-[#5A42C6]">หลังใช้ ProfitBloom</p>
              <ul className="mt-6 space-y-4">
                {['คิดราคาเสร็จภายใน 1–3 นาที', 'ระบบคำนวณต้นทุน-กำไรให้แบบอัตโนมัติ', 'ตั้งราคาได้แม่นยำ มีมาตรฐาน', 'มีประวัติงานย้อนหลังครบถ้วน', 'ออกใบเสนอราคาภายในมือถือ → ปิดงานได้เร็วขึ้น 3 เท่า'].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-[#35235e] font-medium">
                    <span className="w-6 h-6 rounded-full bg-[#7E66F6] text-white flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" strokeWidth={3} /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button onClick={signup} className={`${btnPrimary} mt-12 !px-10`}>เริ่มใช้ ProfitBloom ฟรีวันนี้</button>
        </div>
      </section>

      {/* ---------- Try free ---------- */}
      <section className={`relative overflow-hidden ${SECTION}`}>
        <div className="absolute inset-0 bg-[radial-gradient(45%_70%_at_25%_50%,#9B86F8_0%,#CFC3FF_40%,#F7F4FF_70%,#ffffff_90%)]" />
        <div className={`relative ${CONTAINER} grid lg:grid-cols-2 gap-14 items-center`}>
          <div className="relative flex justify-center">
            <AppPhone className="w-[290px] md:w-[320px] h-[580px] md:h-[640px]" />
            <ReviewBadge className="absolute bottom-20 right-0 sm:right-6 lg:right-2" />
          </div>
          <div className="text-center lg:text-left">
            <p className="text-[36px] md:text-[52px] font-bold leading-tight">
              <span style={{ color: PLUM }}>ใช้ </span>
              <span style={{ color: OLIVE }}>ProfitBloom ฟรี!</span>
            </p>
            <p className="mt-3 text-[22px] md:text-[28px] font-semibold leading-snug" style={{ color: PLUM }}>
              แค่เพิ่มรายการแรก
              <br />
              ระบบจะคำนวณทุกอย่างให้ทันที
            </p>
            <p className={`mt-6 max-w-[460px] mx-auto lg:mx-0 ${LEAD}`}>
              ไม่มีพื้นฐานบัญชีก็เริ่มต้นได้ทันที ทดลองใช้ฟรี 30 วัน และเปลี่ยนธุรกิจดอกไม้ของคุณให้มีกำไรแบบยั่งยืน
            </p>
            <button onClick={signup} className={`${btnPrimary} mt-8 !px-9`}>ทดลองใช้ฟรีทันที</button>
          </div>
        </div>
      </section>

      {/* ---------- Cost management ---------- */}
      <section className={SECTION}>
        <div className={`${CONTAINER} text-center`}>
          <Title a="Cost Management" b="& Profit Calculation" />
          <p className={`mt-6 max-w-[720px] mx-auto ${LEAD}`}>
            เครื่องมือที่ออกแบบมาเพื่อธุรกิจดอกไม้และจัดงานโดยเฉพาะ ช่วยให้คุณรู้ต้นทุนจริงของทุกงาน ตั้งราคาได้อย่างมั่นใจ
            และเห็นกำไรของร้านชัดเจนในที่เดียว
          </p>
          <div className="mt-20 grid md:grid-cols-3 gap-x-6 gap-y-16 md:gap-8">
            {[
              { icon: FileText, title: 'คำนวณต้นทุนแม่นยำ', en: 'Accurate Cost Calculation', text: 'รู้ต้นทุนที่แท้จริงของงานดอกไม้และจัดงาน รวมอุปกรณ์ทุกชิ้น หมดปัญหาตั้งราคาขาดทุนโดยไม่รู้ตัว' },
              { icon: Calendar, title: 'ตั้งราคาขายอย่างมืออาชีพ', en: 'Professional Pricing Setup', text: 'กำหนดราคาขายตามเปอร์เซ็นต์กำไรที่คุณต้องการ พร้อมเครื่องมือช่วยคิดอัตโนมัติ ให้ตั้งราคาถูกต้องในทุกออเดอร์' },
              { icon: Users, title: 'วางแผนกำไรอย่างมีระบบ', en: 'Profit Planning System', text: 'ดูรายงานกำไร รายได้ และต้นทุนรวมแบบชัดเจน ช่วยให้วางแผนการเติบโตระยะยาวได้อย่างแม่นยำ' },
            ].map(({ icon: Icon, title, en, text }) => (
              <div key={title} className={`relative ${CARD} pt-14 pb-9 px-7`}>
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-[72px] h-[72px] rounded-full bg-gradient-to-b from-[#8A72F0] to-[#5A42C6] text-white flex items-center justify-center shadow-[0_12px_24px_-8px_rgba(90,66,198,0.7)] ring-8 ring-white">
                  <Icon className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold" style={{ color: GOLD }}>{title}</p>
                <p className="text-sm font-medium" style={{ color: GOLD }}>({en})</p>
                <p className="mt-4 text-[15px] text-[#5B566D] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className={`${SECTION} bg-[#FAF8FF] scroll-mt-20`}>
        <div className={`${CONTAINER} grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center`}>
          <div>
            <h2 className={H2}>
              <span style={{ color: VIOLET }}>Feature</span>
              <br />
              <span style={{ color: GOLD }}>ฟีเจอร์เด่นของ ProfitBloom</span>
            </h2>
            <p className={`mt-5 max-w-[520px] ${LEAD}`}>
              ไม่ใช่แค่เครื่องคิดเลข แต่ช่วยให้คุณตัดสินใจได้อย่างมั่นใจ — ก่อนเสนอราคา ก่อนรับงาน และก่อนลดราคา
            </p>
            <div className="mt-10 grid sm:grid-cols-2 gap-x-10 gap-y-9">
              {[
                { icon: ClipboardCheck, title: 'เช็คก่อนรับงาน', text: 'ใส่งบที่ลูกค้าเสนอ ตอบคำถามสั้น ๆ 10 ข้อ รู้ทันทีว่า “รับได้ / รับได้แต่ควรปรับ / เสี่ยงขาดทุน” พร้อมเหตุผล' },
                { icon: Gauge, title: 'Job Health Check', text: 'คะแนนสุขภาพกำไร 0–100, Margin, เงินสดที่ต้องสำรอง และช่วงราคาที่ควรเสนอ อ่านจบในหน้าจอเดียว' },
                { icon: ShieldCheck, title: 'Quote Health Check', text: 'ตรวจจุดเสี่ยงก่อนกดส่ง เช่น ลืมค่าแรงตัวเอง ไม่มีค่าเก็บงาน หรือมัดจำไม่พอจ่ายก่อนงาน' },
                { icon: SlidersHorizontal, title: 'จำลองสถานการณ์', text: '“ถ้าลูกค้าลดงบ 15%” หรือ “ดอกไม้ขึ้นราคา 20%” เห็นกำไรและ Margin ที่เปลี่ยนไปทันที' },
                { icon: FileText, title: 'ใบเสนอราคา PDF', text: 'สร้างใบเสนอราคาจากต้นทุนที่คิดไว้ ไม่ต้องกรอกซ้ำ ส่งให้ลูกค้าได้ทันที' },
                { icon: TrendingUp, title: 'สรุปกำไรจริงหลังงาน', text: 'เทียบกำไรที่คาดกับกำไรจริง รู้ว่าหายไปตรงไหน แล้วนำบทเรียนไปใช้ตั้งราคางานถัดไป' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <span className="w-12 h-12 rounded-2xl bg-white border border-[#EFEBFA] shadow-[0_8px_20px_-12px_rgba(90,66,198,0.5)] flex items-center justify-center text-[#7E66F6]">
                    <Icon className="w-6 h-6" strokeWidth={1.8} />
                  </span>
                  <p className="mt-4 text-lg font-bold leading-snug">{title}</p>
                  <p className="mt-2 text-[15px] text-[#5B566D] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center py-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[460px] md:h-[460px] rounded-full border border-[#D9B567]/80" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[370px] md:h-[370px] rounded-full border-[6px] border-[#E2B13A]" />
            <div className="relative w-[260px] md:w-[290px] rounded-[44px] bg-[#1b1b1f] p-[9px] shadow-[0_40px_80px_-30px_rgba(34,26,51,0.55)]">
              <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1b1b1f] rounded-full z-10" />
              <div className="rounded-[36px] bg-[#E6ECFB] px-3 pb-3 pt-10 grid grid-cols-2 auto-rows-[150px] md:auto-rows-[160px] gap-2.5 overflow-hidden">
                {['f1', 'f2', 'f3', 'f4', 'f5', 'f6'].map((f) => (
                  <div key={f} className={`rounded-xl overflow-hidden ${f === 'f4' ? 'outline outline-2 outline-dashed outline-[#EF4444] outline-offset-2' : ''}`}>
                    <img src={`/landing/${f}.webp`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className={`relative ${SECTION} overflow-hidden bg-gradient-to-br from-[#7E66F6] via-[#6550D2] to-[#5A7E48]`}>
        <div className={CONTAINER}>
          <h2 className={`${H2} text-white max-w-[720px]`}>เสียงจากธุรกิจ ดอกไม้และจัดงานที่ใช้ ProfitBloom แล้วได้กำไรจริง</h2>
        </div>
        <div className="mt-12 flex gap-6 overflow-x-auto no-scrollbar px-6 md:px-[max(24px,calc((100vw_-_1200px)/2_+_24px))] snap-x scroll-pl-6 md:scroll-pl-[max(24px,calc((100vw_-_1200px)/2_+_24px))] pb-2">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="snap-start shrink-0 w-[300px] md:w-[360px] bg-white rounded-[24px] p-7 md:p-8 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <blockquote className="text-[15px] text-[#221A33] leading-relaxed flex-1">{t.quote}</blockquote>
              <figcaption className="mt-6 pt-6 border-t border-[#F1EEF8] flex items-center gap-4">
                <img src={t.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-[#221A33]">{t.name}</p>
                  <p className="text-sm text-[#5B566D]">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className={`relative ${SECTION} scroll-mt-20`}>
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(70%_100%_at_50%_100%,#D9CCFF,transparent)]" />
        <div className={`relative ${CONTAINER} text-center`}>
          <Title a="Pricing" b="& Detail" />
          <p className={`mt-6 max-w-[720px] mx-auto ${LEAD}`}>
            เพิ่มกำไรให้ธุรกิจ ดอกไม้และจัดงานของคุณได้ทันที ด้วยแผนการใช้งานที่ออกแบบมาเพื่อทุกขนาดธุรกิจ
            ทดลองใช้ ProfitBloom วันนี้ แล้วดูผลลัพธ์การเติบโตอย่างมืออาชีพ
          </p>
          <div className="mt-14 grid md:grid-cols-3 gap-6 lg:gap-7 max-w-[1080px] mx-auto text-left items-stretch">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-[24px] p-7 lg:p-8 flex flex-col ${
                  p.popular
                    ? 'bg-gradient-to-b from-[#5D49D0] to-[#4A37B5] text-white shadow-[0_30px_60px_-24px_rgba(83,64,195,0.75)] ring-1 ring-white/10'
                    : CARD
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#C09036] text-white text-[11px] font-bold tracking-wider shadow-md whitespace-nowrap">
                    MOST POPULAR
                  </span>
                )}
                <p className="text-2xl font-bold">{p.name}</p>
                <p className={`mt-2 text-sm leading-relaxed min-h-[66px] whitespace-pre-line ${p.popular ? 'text-white/85' : 'text-[#5B566D]'}`}>{p.tagline}</p>
                <div className="mt-6 flex items-end gap-2.5">
                  <span className="text-[44px] leading-none font-bold tracking-tight">{p.price}</span>
                  <span className="text-sm leading-tight pb-1">
                    <span className={p.popular ? 'text-white/85' : 'text-[#5B566D]'}>{p.priceNote}</span>
                    <br />
                    <span className="whitespace-nowrap" style={{ color: p.id === 'trial' ? '#5A42C6' : p.popular ? '#F2CF7E' : GOLD }}>{p.priceSub}</span>
                  </span>
                </div>
                <p className={`mt-3 text-sm ${p.id === 'trial' ? 'text-[#5A42C6] font-medium' : `line-through ${p.popular ? 'text-white/60' : 'text-[#8C879D]'}`}`}>
                  {p.footnote}
                </p>
                <div className={`my-6 h-px ${p.popular ? 'bg-white/15' : 'bg-[#EFEBFA]'}`} />
                <ul className="space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className={`flex gap-3 text-sm leading-relaxed ${p.popular ? 'text-white' : 'text-[#3F3A52]'}`}>
                      <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.popular ? 'bg-white/15' : 'bg-[#F1EEFC]'}`}>
                        <Check className={`w-3 h-3 ${p.popular ? 'text-white' : 'text-[#5A42C6]'}`} strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={signup} className={`${btnGold} mt-8 w-full`}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Community ---------- */}
      <section className={SECTION}>
        <div className={`${CONTAINER} grid lg:grid-cols-2 gap-14 lg:gap-16 items-center`}>
          <div className="grid grid-cols-3 gap-3 md:gap-4" aria-hidden>
            <div className="space-y-3 md:space-y-4 pt-12">
              {['c1', 'c2', 'c3'].map((c) => <img key={c} src={`/landing/${c}.webp`} alt="" className="w-full aspect-[4/5] object-cover rounded-2xl shadow-[0_12px_28px_-14px_rgba(34,26,51,0.45)]" />)}
            </div>
            <div className="space-y-3 md:space-y-4">
              {['c6', 'c7', 'c8'].map((c) => <img key={c} src={`/landing/${c}.webp`} alt="" className="w-full aspect-[4/5] object-cover rounded-2xl shadow-[0_12px_28px_-14px_rgba(34,26,51,0.45)]" />)}
            </div>
            <div className="space-y-3 md:space-y-4 pt-24">
              {['c9', 'c10'].map((c) => <img key={c} src={`/landing/${c}.webp`} alt="" className="w-full aspect-[4/5] object-cover rounded-2xl shadow-[0_12px_28px_-14px_rgba(34,26,51,0.45)]" />)}
            </div>
          </div>
          <div>
            <h2 className={H2} style={{ color: VIOLET }}>Community</h2>
            <p className="mt-2 text-[20px] md:text-[23px] font-bold leading-snug" style={{ color: GOLD }}>ของธุรกิจ ดอกไม้และจัดงานที่เติบโตไปด้วยกัน</p>
            <p className={`mt-6 ${LEAD}`}>
              เข้าร่วมกับเจ้าของธุรกิจ ดอกไม้และจัดงาน หลายร้อยรายที่ใช้ ProfitBloom เพื่อเพิ่มกำไร วางแผนธุรกิจ และขยายร้านของพวกเขา
              ใน Community นี้ คุณจะได้พบกับ
            </p>
            <ul className="mt-6 space-y-3">
              {['การแบ่งปันเคล็ดลับการตั้งราคาแบบมืออาชีพ', 'เทคนิคการวางแผนต้นทุนให้กำไรโตอย่างยั่งยืน', 'ตัวอย่างเคสจริงจากผู้ใช้ที่ประสบความสำเร็จ', 'กิจกรรมพิเศษ เช่น เวิร์กช็อปออนไลน์ แชร์ประสบการณ์'].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[#221A33]">
                  <span className="mt-1 w-5 h-5 rounded-full bg-[#F1EDFE] text-[#7E66F6] flex items-center justify-center shrink-0"><Check className="w-3 h-3" strokeWidth={3} /></span>
                  {t}
                </li>
              ))}
            </ul>
            <a href={LINKS.community || contactHref} target={LINKS.community ? '_blank' : undefined} rel="noreferrer" className="mt-8 inline-flex items-center gap-2 font-semibold text-[#5A42C6] hover:gap-3 transition-all">
              Explore Community <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Smartest way: contained call-to-action ---------- */}
      <section className="pb-20 md:pb-28">
        <div className={CONTAINER}>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#F4F0FF] via-[#E6DDFF] to-[#C9B9FF] px-8 md:px-14 pt-12 md:pt-16 grid lg:grid-cols-[1.25fr_0.75fr] gap-8 items-end">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#9B86F8]/40 blur-3xl" aria-hidden />
            <div className="relative pb-12 md:pb-16 text-center lg:text-left">
              <h2 className={`${H2} md:!text-[40px]`}>
                <span className={gradientText}>The Smartest Way to Price, Plan,</span>{' '}
                <span style={{ color: GOLD }}>and Grow Your Floral Business.</span>
              </h2>
              <p className={`mt-5 max-w-[560px] mx-auto lg:mx-0 ${LEAD}`}>
                เริ่มต้นตั้งราคาขายแม่นยำ พร้อมเพิ่มกำไรอย่างยั่งยืน พูดคุยกับทีม ProfitBloom เพื่อดูว่าโปรแกรมของเราจะช่วยธุรกิจดอกไม้ของคุณได้อย่างไร
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <button onClick={signup} className={`${btnPrimary} !px-8`}>ทดลองใช้ฟรี</button>
                <a href={contactHref} className="inline-flex items-center rounded-full px-8 py-3.5 bg-white text-[#5A42C6] font-semibold shadow-[0_8px_20px_-10px_rgba(34,26,51,0.3)] hover:bg-[#FAF8FF]">Contact Us</a>
              </div>
            </div>
            <div className="relative hidden lg:flex justify-center h-[380px]">
              <AppPhone className="absolute top-0 w-[270px] h-[540px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="bg-gradient-to-br from-[#8F7AF8] via-[#6A51D8] to-[#4733B5] text-white">
        <div className={`${CONTAINER} pt-20 pb-10 text-center`}>
          <p className="text-[28px] md:text-[40px] font-bold leading-snug">
            สร้างด้วยความเข้าใจ เพื่อธุรกิจ
            <br />
            ดอกไม้และจัดงานที่เติบโตอย่างยั่งยืน
          </p>
          <a href={contactHref} className="mt-8 inline-flex rounded-full bg-white text-[#5A42C6] font-semibold px-10 py-3.5 shadow-[0_12px_28px_-10px_rgba(0,0,0,0.35)] hover:bg-[#F4F1FE]">
            Contact Us
          </a>
          <div className="mt-16 pt-8 border-t border-white/20 grid md:grid-cols-3 items-center gap-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <img src="/landing/logo-white.png" alt="" className="h-10 w-auto" />
              <span className="text-lg font-bold">ProfitBloom</span>
            </div>
            <nav className="flex gap-8 justify-center text-sm text-white/90">
              {LINKS.courses && <a href={LINKS.courses} className="hover:text-white">Courses</a>}
              <button onClick={() => scrollTo('about')} className="hover:text-white">About</button>
              <button onClick={() => scrollTo('features')} className="hover:text-white">Features</button>
              {LINKS.blog && <a href={LINKS.blog} className="hover:text-white">Blog</a>}
              <button onClick={() => scrollTo('pricing')} className="hover:text-white">Pricing</button>
            </nav>
            <div className="flex gap-3 justify-center md:justify-end">
              {socials.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <p className="mt-8 text-sm text-white/70">© {new Date().getFullYear()} ProfitBloom. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
