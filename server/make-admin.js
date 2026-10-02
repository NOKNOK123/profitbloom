// Usage: npm run make-admin -- someone@example.com   (add --remove to take admin away)
import { db, ready } from './db.js';

const email = process.argv[2];
const remove = process.argv.includes('--remove');
if (!email) {
  console.error('ระบุอีเมล เช่น  npm run make-admin -- admin@profitbloom.co.th');
  process.exit(1);
}
await ready;
const { changes } = await db.prepare('UPDATE users SET role = ? WHERE email = ?').run(remove ? 'shop' : 'admin', email.toLowerCase());
if (!changes) {
  console.error(`ไม่พบบัญชี ${email} — ให้สมัครสมาชิกผ่านหน้าเว็บก่อน`);
  process.exit(1);
}
console.log(remove ? `${email} ไม่ใช่ผู้ดูแลระบบแล้ว` : `${email} เป็นผู้ดูแลระบบแล้ว (รีเฟรชหน้าเว็บเพื่อเห็นเมนูผู้ดูแลระบบ)`);
