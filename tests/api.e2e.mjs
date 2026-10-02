// End-to-end API checks for ProfitBloom. Run with `npm test` (starts its own server on a throwaway database).
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE;
const PROJECT_DIR = process.env.PROJECT_DIR;
const results = [];
const ok = (name, cond, extra = '') => results.push({ name, pass: !!cond, extra });

function client() {
  let cookie = '';
  const call = async (method, url, body) => {
    const res = await fetch(BASE + '/api' + url, {
      method,
      headers: { ...(body !== undefined && { 'content-type': 'application/json' }), ...(cookie && { cookie }) },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0].endsWith('=') ? '' : set.split(';')[0];
    let data = null;
    try { data = await res.json(); } catch {}
    return { status: res.status, data };
  };
  return { call, get cookie() { return cookie; }, set cookie(v) { cookie = v; } };
}

const A = client(), B = client(), ADM = client(), A2 = client();
const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const thisMonth = iso(new Date(today.getFullYear(), today.getMonth(), 15));
const past = iso(new Date(Date.now() - 3 * 864e5));

// --- auth
let r = await A.call('GET', '/projects');
ok('ไม่ login เรียกข้อมูลไม่ได้ (401)', r.status === 401);
r = await A.call('POST', '/auth/register', { name: '', email: 'a@x.test', password: 'password123' });
ok('สมัคร: ไม่กรอกชื่อ ถูกปฏิเสธ', r.status === 400);
r = await A.call('POST', '/auth/register', { name: 'A', email: 'not-an-email', password: 'password123' });
ok('สมัคร: อีเมลผิดรูปแบบ ถูกปฏิเสธ', r.status === 400);
r = await A.call('POST', '/auth/register', { name: 'A', email: 'a@x.test', password: 'short' });
ok('สมัคร: รหัสสั้นกว่า 8 ถูกปฏิเสธ', r.status === 400);
r = await A.call('POST', '/auth/register', { name: 'ร้านเอ', email: 'A@X.test', password: 'password123' });
ok('สมัครสำเร็จ + เริ่มที่ Free Trial + role shop', r.status === 200 && r.data.user.plan === 'trial' && r.data.user.role === 'shop', JSON.stringify(r.data));
{
  const days = (new Date(r.data.user.trialEndsAt) - Date.now()) / 864e5;
  ok('ทดลองใช้ฟรี 30 วันนับจากวันสมัคร', days > 29.9 && days <= 30, days);
}
r = await B.call('POST', '/auth/register', { name: 'B', email: 'a@x.test', password: 'password123' });
ok('สมัครซ้ำอีเมลเดิม (ตัวพิมพ์ต่างกัน) ถูกปฏิเสธ', r.status === 409);
r = await B.call('POST', '/auth/register', { name: 'ร้านบี', email: 'b@x.test', password: 'password123' });
ok('สมัครร้านที่สอง', r.status === 200);
r = await A2.call('POST', '/auth/login', { email: 'a@x.test', password: 'wrong-pass' });
ok('login รหัสผิด ถูกปฏิเสธ', r.status === 401);
r = await A2.call('POST', '/auth/login', { email: 'a@x.test', password: 'password123' });
ok('login อีกเครื่องได้', r.status === 200);

// --- projects
r = await A.call('POST', '/projects', { title: '' });
ok('สร้างโปรเจ็กต์ไม่มีชื่อ ถูกปฏิเสธ', r.status === 400);
r = await A.call('POST', '/projects', {
  title: 'งานแต่ง 1', projectType: 'งานแต่งงาน', client: 'ลูกค้า1', eventDate: thisMonth, budget: 50000, profitMargin: 25,
  costItems: [{ name: 'ดอกไม้', quantity: 10, price: 100 }, { name: 'ค่าแรง', quantity: 1, price: 1000 }],
});
const p1 = r.data;
ok('สร้างโปรเจ็กต์ + รหัส WD-ปี-001', r.status === 201 && /^WD-\d{4}-001$/.test(p1.code), p1?.code);
ok('ต้นทุนรวมถูกต้อง (2,000)', p1.costItems.reduce((s, i) => s + i.total, 0) === 2000);
r = await A.call('POST', '/projects', { title: 'งานแต่ง 2', projectType: 'งานแต่งงาน', client: 'ลูกค้า2' });
ok('รหัสโปรเจ็กต์ถัดไปเป็น 002', r.data.code.endsWith('-002'), r.data.code);
const p2 = r.data;
r = await A.call('POST', '/projects', { title: 'งานอื่น', projectType: 'อื่นๆ', costItems: [{ name: 'x', quantity: -5, price: -10 }] });
ok('ประเภทอื่นๆ ได้รหัส EV + จำนวน/ราคาติดลบถูกปรับเป็น 0', r.data.code.startsWith('EV-') && r.data.costItems[0].quantity === 0 && r.data.costItems[0].price === 0, JSON.stringify(r.data.costItems));

// decision-engine data round-trips
r = await A.call('POST', '/projects', {
  title: 'งานทดสอบเงื่อนไข', projectType: 'งานแต่งงาน', profitMargin: 50, depositPct: 45, setupDays: 2, eventDays: 1, laborDays: 3, teamSize: 4,
  ownerLabor: true, teardown: false,
  costItems: [
    { name: 'ดอกไม้', category: 'material', quantity: 1, price: 1000, paidBefore: true },
    { name: 'ทีม', category: 'labor', quantity: 2, price: 800, paidBefore: false, actual: 1900 },
    { name: 'แปลก', category: 'hacker', quantity: 1, price: 10 },
  ],
});
{
  const d = r.data;
  ok('บันทึกเงื่อนไขงาน (มัดจำ/วันเซ็ตอัพ/ทีม/ค่าแรงเจ้าของ/เก็บงาน)', d.depositPct === 45 && d.setupDays === 2 && d.laborDays === 3 && d.teamSize === 4 && d.ownerLabor === true && d.teardown === false, JSON.stringify(d));
  ok('บันทึกหมวด จ่ายก่อนงาน และต้นทุนจริง', d.costItems[1].category === 'labor' && d.costItems[1].paidBefore === false && d.costItems[1].actual === 1900, JSON.stringify(d.costItems[1]));
  ok('หมวดที่ไม่มีอยู่จริงถูกปรับเป็น material', d.costItems[2].category === 'material');
  r = await A.call('PUT', `/projects/${d.id}`, { costItems: [...d.costItems, { name: 'ซื้อหน้างาน', category: 'other', quantity: 0, price: 0, actual: 500, isExtra: true }], reviewApplied: true });
  ok('เพิ่มค่าใช้จ่ายนอกแผน + บันทึกบทเรียน', r.data.costItems.at(-1).isExtra === true && r.data.reviewApplied === true && !!r.data.reviewedAt, JSON.stringify(r.data.costItems.at(-1)));
  r = await A.call('PUT', `/projects/${d.id}`, { notes: 'x' });
  ok('แก้ช่องอื่น เงื่อนไขงานไม่หาย', r.data.depositPct === 45 && r.data.ownerLabor === true && r.data.costItems.length === 4);
  await A.call('DELETE', `/projects/${d.id}`);
}
r = await A.call('PUT', '/account', { name: 'ร้านเอ', rules: { minMargin: 30, goodMargin: 40, highRiskMargin: 15, dailyWage: 900, bogus: 1 } });
ok('บันทึกกติกาธุรกิจของร้าน', r.data.user.rules.minMargin === 30 && r.data.user.rules.dailyWage === 900 && !('bogus' in r.data.user.rules), JSON.stringify(r.data.user.rules));
r = await A.call('PUT', '/account', { name: 'ร้านเอ', rules: { minMargin: 40, goodMargin: 30 } });
ok('กติกาขัดกันเอง (ขั้นต่ำ > ที่ดี) ถูกปฏิเสธ', r.status === 400);
r = await B.call('GET', '/auth/me');
ok('กติกาของร้าน A ไม่กระทบร้าน B', Object.keys(r.data.user.rules).length === 0);

// isolation
r = await B.call('GET', `/projects/${p1.id}`);
ok('ร้าน B อ่านโปรเจ็กต์ของ A ไม่ได้', r.status === 404);
r = await B.call('PUT', `/projects/${p1.id}`, { title: 'hacked' });
ok('ร้าน B แก้โปรเจ็กต์ของ A ไม่ได้', r.status === 404);
r = await B.call('DELETE', `/projects/${p1.id}`);
ok('ร้าน B ลบโปรเจ็กต์ของ A ไม่ได้', r.status === 404);
r = await B.call('GET', '/projects');
ok('รายการโปรเจ็กต์ของ B ไม่มีของ A', r.data.length === 0);
r = await B.call('POST', '/quotes', { clientName: 'x', projectId: p1.id });
ok('ร้าน B ผูกใบเสนอราคากับโปรเจ็กต์ของ A ไม่ได้', r.status === 404);

r = await A.call('PUT', `/projects/${p1.id}`, { notes: 'แก้ไขหมายเหตุ' });
ok('แก้บางช่อง ข้อมูลอื่น + รายการต้นทุนยังอยู่', r.data.notes === 'แก้ไขหมายเหตุ' && r.data.costItems.length === 2 && r.data.title === 'งานแต่ง 1');
r = await A.call('PUT', `/projects/${p1.id}`, { status: 'bogus' });
ok('สถานะที่ไม่มีอยู่จริงไม่ถูกบันทึก', r.data.status === 'draft');

// --- quotes
r = await A.call('POST', '/quotes', { clientName: '' });
ok('ใบเสนอราคาไม่มีชื่อลูกค้า ถูกปฏิเสธ', r.status === 400);
r = await A.call('POST', '/quotes', {
  projectId: p1.id, clientName: 'ลูกค้า1', projectTitle: 'งานแต่ง 1', validUntil: iso(new Date(Date.now() + 10 * 864e5)),
  taxRate: 7, discountRate: 10, items: [{ description: 'แพ็กดอกไม้', quantity: 2, unitPrice: 1000 }],
});
const q1 = r.data;
ok('สร้างใบเสนอราคา + รหัส QT', r.status === 201 && /^QT-\d{4}-001$/.test(q1.code), q1?.code);
ok('ยอดรวม: 2,000 -10% +7% = 1,926', Math.abs(q1.totalAmount - 1926) < 0.001, q1.totalAmount);
r = await A.call('GET', `/projects/${p1.id}`);
ok('สร้างใบเสนอราคา → โปรเจ็กต์เป็น "สร้างใบเสนอราคาแล้ว"', r.data.status === 'quote_created', r.data.status);
r = await A.call('PUT', `/quotes/${q1.id}`, { status: 'sent' });
r = await A.call('GET', `/projects/${p1.id}`);
ok('ส่งใบเสนอราคา → โปรเจ็กต์ "รอการอนุมัติ"', r.data.status === 'pending', r.data.status);
r = await A.call('PUT', `/quotes/${q1.id}`, { status: 'approved' });
r = await A.call('GET', `/projects/${p1.id}`);
ok('อนุมัติใบเสนอราคา → โปรเจ็กต์ "อนุมัติแล้ว"', r.data.status === 'approved', r.data.status);
r = await A.call('PUT', `/quotes/${q1.id}`, { notes: 'แก้หมายเหตุ' });
ok('แก้ใบเสนอราคาโดยไม่ส่งสถานะ สถานะเดิมยังอยู่', r.data.status === 'approved' && r.data.items.length === 1);
r = await B.call('GET', `/quotes/${q1.id}`);
ok('ร้าน B อ่านใบเสนอราคาของ A ไม่ได้', r.status === 404);
r = await B.call('PUT', `/quotes/${q1.id}`, { status: 'rejected' });
ok('ร้าน B แก้ใบเสนอราคาของ A ไม่ได้', r.status === 404);

r = await A.call('POST', '/quotes', { clientName: 'หมดอายุ', validUntil: past, status: 'sent' });
ok('ใบเสนอราคาเลยวันหมดอายุ แสดงเป็น "หมดอายุ"', r.data.status === 'expired', r.data.status);
const qExp = r.data;
r = await A.call('PUT', `/quotes/${qExp.id}`, { status: 'approved' });
ok('ใบที่หมดอายุยังอนุมัติได้', r.data.status === 'approved');

// --- dashboard / reports
r = await A.call('GET', '/dashboard?range=6');
// p1: cost 2000, margin 25% → sales 2500, profit 500, approved, event this month
ok('Dashboard: ยอดขายเดือนนี้ 2,500 / กำไร 500', r.data.stats.salesThisMonth === 2500 && r.data.stats.profitThisMonth === 500, JSON.stringify(r.data.stats));
ok('Dashboard: กราฟ 6 เดือน', r.data.chart.length === 6);
ok('Dashboard: โปรเจ็กต์ดำเนินการ 3', r.data.stats.activeProjects === 3, r.data.stats.activeProjects);
r = await A.call('GET', '/dashboard?range=12');
ok('Dashboard: กราฟ 12 เดือน', r.data.chart.length === 12);
r = await A.call('GET', '/reports');
ok('Reports: ยอดรวม 2,500 กำไร 500 ต้นทุน 2,000', r.data.totals.sales === 2500 && r.data.totals.profit === 500 && r.data.totals.cost === 2000, JSON.stringify(r.data.totals));
r = await B.call('GET', '/reports');
ok('Reports ของ B ไม่รวมข้อมูล A', r.data.totals.projects === 0);

// delete project with a linked quote
r = await A.call('DELETE', `/projects/${p1.id}`);
r = await A.call('GET', `/quotes/${q1.id}`);
ok('ลบโปรเจ็กต์ → ใบเสนอราคาที่ผูกไว้ยังอยู่ (ไม่ผูกโปรเจ็กต์แล้ว)', r.status === 200 && r.data.projectId === null);
r = await A.call('PUT', `/quotes/${q1.id}`, { status: 'sent' });
ok('แก้ใบเสนอราคาหลังโปรเจ็กต์ถูกลบ ไม่ error', r.status === 200, r.status);
r = await A.call('DELETE', `/quotes/${q1.id}`);
ok('ลบใบเสนอราคา', r.status === 200);
r = await A.call('GET', '/activities?limit=50');
ok('มีบันทึกกิจกรรม', r.data.length >= 5, r.data.length);

// --- account
r = await A.call('PUT', '/account', { name: 'ร้านเอ', businessName: 'ร้านดอกไม้เอ', businessLogo: 'data:text/html;base64,PHNjcmlwdD4=' });
ok('อัปโหลดโลโก้ที่ไม่ใช่รูป ถูกปฏิเสธ', r.status === 400);
r = await A.call('PUT', '/account', { name: 'ร้านเอ', businessName: 'ร้านดอกไม้เอ', businessLogo: 'data:image/png;base64,' + 'A'.repeat(500_000) });
ok('โลโก้ใหญ่เกิน ถูกปฏิเสธ', r.status === 400 || r.status === 413, r.status);
r = await A.call('PUT', '/account', { name: 'ร้านเอ', businessName: 'ร้านดอกไม้เอ', businessLogo: 'data:image/png;base64,iVBORw0KGgo=' });
ok('บันทึกชื่อร้าน + โลโก้', r.status === 200 && r.data.user.businessName === 'ร้านดอกไม้เอ' && r.data.user.businessLogo.startsWith('data:image/png'));
r = await A.call('PUT', '/account', { name: 'ร้านเอ', plan: 'enterprise', role: 'admin' });
ok('ร้านเปลี่ยนแพ็กเกจ/สิทธิ์ตัวเองไม่ได้', r.data.user.plan === 'trial' && r.data.user.role === 'shop', JSON.stringify(r.data.user));
r = await A.call('PUT', '/account', { name: 'ร้านเอ', newPassword: 'newpassword1', currentPassword: 'wrong' });
ok('เปลี่ยนรหัส: รหัสเดิมผิด ถูกปฏิเสธ', r.status === 400);
r = await A.call('PUT', '/account', { name: 'ร้านเอ', newPassword: 'newpassword1', currentPassword: 'password123' });
ok('เปลี่ยนรหัสผ่านสำเร็จ', r.status === 200);
r = await A2.call('GET', '/projects');
ok('เปลี่ยนรหัสแล้ว เครื่องอื่นถูกออกจากระบบ', r.status === 401);
r = await A.call('GET', '/projects');
ok('เครื่องที่เปลี่ยนรหัสยังใช้งานต่อได้', r.status === 200);

// --- admin
r = await A.call('GET', '/admin/shops');
ok('ร้านทั่วไปเข้าหน้าแอดมินไม่ได้ (403)', r.status === 403);
r = await ADM.call('POST', '/auth/register', { name: 'แอดมิน', email: 'admin@x.test', password: 'password123' });
execFileSync('node', ['server/make-admin.js', 'admin@x.test'], { cwd: PROJECT_DIR, env: { ...process.env } });
r = await ADM.call('GET', '/auth/me');
ok('make-admin แล้ว role = admin (ไม่ต้อง login ใหม่)', r.data.user.role === 'admin');
r = await ADM.call('GET', '/admin/shops');
ok('แอดมินเห็นร้านทั้งหมด 3 ร้าน', r.status === 200 && r.data.length === 3, r.data?.length);
const shopA = r.data.find((s) => s.email === 'a@x.test');
ok('ข้อมูลร้าน A: 2 โปรเจ็กต์ 1 ใบเสนอราคา มีโลโก้', shopA.projects === 2 && shopA.quotes === 1 && shopA.hasLogo, JSON.stringify(shopA));
ok('รายการแอดมินไม่ส่งรหัสผ่าน/โลโก้เต็ม', !('password_hash' in shopA) && !('businessLogo' in shopA));
r = await ADM.call('PUT', `/admin/shops/${shopA.id}`, { plan: 'gold' });
ok('แพ็กเกจที่ไม่มีอยู่จริง ถูกปฏิเสธ', r.status === 400);
r = await ADM.call('PUT', `/admin/shops/${shopA.id}`, { plan: 'enterprise' });
ok('ชื่อแพ็กเกจเก่า (enterprise) ใช้ไม่ได้แล้ว', r.status === 400);
r = await ADM.call('PUT', `/admin/shops/${shopA.id}`, { plan: 'pro' });
ok('แอดมินเปลี่ยนแพ็กเกจร้าน A เป็น Pro', r.data.plan === 'pro');
r = await A.call('GET', '/auth/me');
ok('ร้าน A เห็นแพ็กเกจใหม่ทันที', r.data.user.plan === 'pro');
r = await A.call('GET', '/activities?limit=1');
ok('ร้าน A มีกิจกรรม "แพ็กเกจเปลี่ยนเป็น Pro"', r.data[0].kind === 'plan_changed' && r.data[0].title.includes('Pro'), r.data[0]?.title);
const me = (await ADM.call('GET', '/auth/me')).data.user;
r = await ADM.call('PUT', `/admin/shops/${me.id}`, { disabled: true });
ok('แอดมินระงับบัญชีตัวเองไม่ได้', r.status === 400);
r = await ADM.call('PUT', `/admin/shops/${shopA.id}`, { disabled: true });
ok('แอดมินระงับร้าน A', r.data.disabled === true);
r = await A.call('GET', '/projects');
ok('ร้าน A ถูกออกจากระบบทันที', r.status === 401);
r = await A.call('POST', '/auth/login', { email: 'a@x.test', password: 'newpassword1' });
ok('ร้าน A login ไม่ได้ + มีข้อความบอกเหตุผล', r.status === 403 && r.data.error.includes('ระงับ'), r.data?.error);
r = await ADM.call('PUT', `/admin/shops/${shopA.id}`, { disabled: false });
r = await A.call('POST', '/auth/login', { email: 'a@x.test', password: 'newpassword1' });
ok('เปิดใช้งานแล้ว ร้าน A login ได้ + ข้อมูลยังอยู่', r.status === 200 && (await A.call('GET', '/projects')).data.length === 2);

// --- misc
r = await A.call('POST', '/projects', '{bad json');
ok('JSON เสีย → 400 ไม่ใช่ 500', r.status === 400, r.status);
r = await A.call('GET', '/nope');
ok('API ที่ไม่มี → 404', r.status === 404);
r = await A.call('POST', '/auth/logout');
r = await A.call('GET', '/auth/me');
ok('logout แล้ว me = null', r.data.user === null);

const S = client();
let okLogins = 0;
for (let i = 0; i < 12; i++) if ((await S.call('POST', '/auth/login', { email: 'b@x.test', password: 'password123' })).status === 200) okLogins++;
ok('login สำเร็จติดกัน 12 ครั้ง ไม่ถูกบล็อก (ร้านที่ใช้เน็ตเดียวกัน)', okLogins === 12, okLogins);
const T = client();
let last;
for (let i = 0; i < 12; i++) last = await T.call('POST', '/auth/login', { email: 'nobody@x.test', password: 'x' });
ok('login ผิดติดกันหลายครั้ง ถูกจำกัด (429)', last.status === 429, last.status);
r = await S.call('POST', '/auth/login', { email: 'b@x.test', password: 'password123' });
ok('คนที่ใส่รหัสผิดถูกบล็อก ไม่กระทบบัญชีอื่น', r.status === 200, r.status);

const failed = results.filter((x) => !x.pass);
for (const x of results) console.log(`${x.pass ? 'PASS' : 'FAIL'}  ${x.name}${!x.pass && x.extra ? '   → ' + x.extra : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} ผ่าน`);
process.exit(failed.length ? 1 : 0);
