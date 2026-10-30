# ProfitBloom

ระบบคำนวณต้นทุน–กำไร และออกใบเสนอราคา สำหรับธุรกิจจัดดอกไม้/จัดงาน

ส่งมอบงาน / เจ้าของใหม่: อ่าน [HANDOVER.md](HANDOVER.md) ก่อน

- **Frontend:** React + Vite + Tailwind (ดีไซน์จาก Figma Make)
- **Backend:** Node.js + Express, ฐานข้อมูล SQLite ผ่าน `@libsql/client` — บนเครื่องใช้ไฟล์ใน `data/`, บน Vercel ใช้ [Turso](https://turso.tech)
- **Login:** อีเมล + รหัสผ่าน (scrypt hash), session cookie แบบ httpOnly

ต้องใช้ Node.js 22.13 ขึ้นไป

## รันบนเครื่อง (development)

```bash
npm install
npm run dev
```

เปิด http://localhost:5173 แล้วสมัครสมาชิกได้เลย
(`npm run dev` รันทั้ง API ที่พอร์ต 3001 และหน้าเว็บที่พอร์ต 5173 โดย Vite ส่งต่อ `/api` ไปที่ API)

ข้อมูลเก็บที่ `data/profitbloom.db` ลบโฟลเดอร์ `data/` ทิ้งได้ถ้าต้องการเริ่มใหม่ทั้งหมด

## หน้าเว็บ

| ที่อยู่ | หน้า |
| --- | --- |
| `/` | หน้าเว็บหลัก (Landing page) |
| `/login`, `/signup` | เข้าสู่ระบบ / สมัครสมาชิก |
| `/app` | ตัวโปรแกรม ProfitBloom |

ข้อความ ตัวเลข ราคาแพ็กเกจ รีวิว อีเมลติดต่อ และลิงก์โซเชียลของหน้าเว็บหลักแก้ได้ที่เดียวใน `src/landing/content.ts`
รูปภาพอยู่ใน `public/landing/`

## แพ็กเกจ

ใช้ชุดเดียวกับหน้าเว็บ: **Free Trial** (30 วัน) / **Starter** (฿990 ต่อปี) / **Pro** (฿1,590 ต่อปี)
ชื่อ ราคา และรายการฟีเจอร์แก้ที่ `PLANS` ใน `src/landing/content.ts` ที่เดียว — หน้าเว็บ หน้าแพ็กเกจในแอป และหน้าแอดมินใช้ข้อมูลชุดนี้

- ร้านที่สมัครใหม่เริ่มที่ Free Trial 30 วัน (เหลือ ≤ 7 วันจะมีแถบเตือนที่หน้าหลัก)
- เปลี่ยนแพ็กเกจได้โดยแอดมินเท่านั้น (ร้านกดเลือกแพ็กเกจ → ส่งอีเมลหาทีม ProfitBloom)
- ยังไม่มีระบบรับชำระเงิน และหมดช่วงทดลองแล้ว**ยังใช้งานต่อได้** (มีแค่แถบเตือน)

## ผู้ดูแลระบบ (ทีม ProfitBloom)

บัญชีจะเป็นแอดมินได้ด้วยคำสั่งบน server เท่านั้น (สมัครผ่านหน้าเว็บก่อน แล้วรัน):

```bash
npm run make-admin -- admin@profitbloom.co.th
```

ถอนสิทธิ์: `npm run make-admin -- admin@profitbloom.co.th --remove`

แอดมินจะเห็นเมนู "ผู้ดูแลระบบ" — ดูร้านทั้งหมด จำนวนโปรเจ็กต์/ใบเสนอราคา การใช้งานล่าสุด เปลี่ยนแพ็กเกจ และระงับ/เปิดใช้งานร้าน
(ร้านที่ถูกระงับจะถูกออกจากระบบทันทีและ login ไม่ได้ ข้อมูลยังอยู่ครบ)

## ทดสอบ

```bash
npm test
```

รัน unit test ของระบบคำนวณ (เทียบกับตัวอย่างใน Product Vision) แล้วตามด้วยการทดสอบ API ทั้งหมด (สมัคร/login, แยกข้อมูลระหว่างร้าน, โปรเจ็กต์, ใบเสนอราคา, ตัวเลข Dashboard/Reports, ตั้งค่าบัญชี, แอดมิน, จำกัดการเดารหัส) บนฐานข้อมูลชั่วคราว ไม่กระทบข้อมูลจริง

## ขึ้นใช้งานจริง (production)

### Vercel + Turso (ที่ใช้อยู่)

- หน้าเว็บ build ด้วย `vite build` → `dist/`, API ทั้งหมดวิ่งผ่าน serverless function `api/index.js` (ดู `vercel.json`)
- ฐานข้อมูลอยู่บน Turso เพราะ Vercel ไม่มี disk ถาวร — ตั้งค่า Environment Variables ใน Vercel:

| ตัวแปร | ความหมาย |
| --- | --- |
| `TURSO_DATABASE_URL` | เช่น `libsql://profitbloom-xxxx.turso.io` |
| `TURSO_AUTH_TOKEN` | token ของฐานข้อมูล |

ตารางถูกสร้างให้อัตโนมัติตอนเรียก API ครั้งแรก
ตั้งแอดมินบนฐานข้อมูลจริง: `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run make-admin -- อีเมล`

### เซิร์ฟเวอร์ทั่วไป (มี disk ถาวร)

```bash
npm install
npm run build
npm start
```

เซิร์ฟเวอร์ตัวเดียวให้บริการทั้งหน้าเว็บและ API ที่พอร์ตจาก `PORT` — ถ้าไม่ตั้ง `TURSO_DATABASE_URL` จะเก็บข้อมูลเป็นไฟล์ใน `DATA_DIR` (ต้องเป็น disk ถาวร)

ต้องเปิดผ่าน **HTTPS** เพราะ cookie ตั้งค่า `Secure` ในโหมด production

## โครงสร้าง

```
server/
  db.js          เชื่อมฐานข้อมูล (Turso หรือไฟล์) + ตาราง
  app.js         API ทั้งหมด (Express)
  index.js       รันแบบเซิร์ฟเวอร์ปกติ + เสิร์ฟไฟล์ใน dist/
api/index.js     ทางเข้าของ Vercel
  make-admin.js  ตั้ง/ถอนสิทธิ์ผู้ดูแลระบบ
tests/           การทดสอบ API (npm test)
src/
  lib/api.ts   ฟังก์ชันเรียก API และ type ที่ใช้ร่วมกัน
  App.tsx      หน้าหลัก, Dashboard, การนำทาง
  lib/pdf.ts   สร้างไฟล์ PDF ใบเสนอราคา
  landing/     หน้าเว็บหลัก (LandingPage.tsx) + เนื้อหาที่แก้ได้ (content.ts)
  components/  หน้าต่าง ๆ (Projects, NewProject, QuickCheck, job/, NewQuote, AllQuotes, QuoteDocument, Reports, Packages, AdminPage, AccountSettings, AuthScreen)
```

## ระบบช่วยตัดสินใจก่อนรับงาน (ตาม Product Vision)

ทุกตัวเลขมาจาก `src/lib/decision.ts` ที่เดียว (กติกาธุรกิจ + การคำนวณ ไม่ใช้ AI) และมี unit test เทียบกับตัวอย่างใน Product Vision ทุกสไลด์

| ส่วน | อยู่ที่ |
| --- | --- |
| Can I Take This Job? (เช็คก่อนรับงาน) | เมนู "เช็คก่อนรับงาน" |
| Job Health Check (คะแนน 0–100) | งานแต่ละงาน ขั้นที่ 1 + หน้าหลัก + การ์ดโปรเจ็กต์ |
| Quote Health Check | ขึ้นทุกครั้งก่อนสร้างใบเสนอราคาจากงาน |
| Scenario Simulator | งานแต่ละงาน ขั้นที่ 3 |
| Estimated vs Actual | งานแต่ละงาน ขั้นที่ 4 + หน้ารายงาน |
| Post-Event Review + Learning Loop | งานแต่ละงาน ขั้นที่ 5 → เตือนเผื่อต้นทุนในงานถัดไป |
| กติกาธุรกิจ (Margin เสี่ยง/ขั้นต่ำ/ที่ดี, มัดจำ, ค่าแรง, ค่ารถ, เกณฑ์ Labor Overrun) | ตั้งค่า → กติกาธุรกิจ |

**Margin = กำไร ÷ ราคาขาย** (ไม่ใช่กำไร ÷ ต้นทุน ซึ่งคือ markup) — ฐานข้อมูลเก็บเป็น markup (`profit_margin`) แต่หน้าจอแสดงและรับค่าเป็น Margin

ยังไม่ได้ทำ (Phase 3 ตาม Roadmap): Industry Benchmark, Pattern ของงานขาดทุน, Bloom AI

## การคำนวณ

- **ราคาขายของโปรเจ็กต์** = ต้นทุนรวม × (1 + markup%) และ **Margin** = กำไร ÷ ราคาขาย
- **ยอดขาย/กำไรบน Dashboard และ Reports** นับเฉพาะโปรเจ็กต์ที่ "อนุมัติแล้ว" หรือ "เสร็จสิ้น" ตามเดือนของวันจัดงาน
- **อัตราความสำเร็จ** = (อนุมัติ + เสร็จสิ้น) ÷ (อนุมัติ + เสร็จสิ้น + ยกเลิก)
- **ใบเสนอราคาที่ผูกกับโปรเจ็กต์** จะเปลี่ยนสถานะโปรเจ็กต์ให้อัตโนมัติ: สร้าง → "สร้างใบเสนอราคาแล้ว", ส่ง → "รอการอนุมัติ", อนุมัติ → "อนุมัติแล้ว"
- **ใบเสนอราคา** ที่เลยวัน "ใช้ได้ถึง" และยังเป็นร่าง/ส่งแล้ว จะแสดงเป็น "หมดอายุ"
