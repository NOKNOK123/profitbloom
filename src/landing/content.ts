/**
 * Everything on the public landing page that the ProfitBloom team is likely to edit.
 * Links left as '' are hidden on the page until they are filled in.
 */

/** Where "Contact Us" and plan-change requests go. TODO: replace with the real ProfitBloom inbox. */
export const CONTACT_EMAIL = 'sales@profitbloom.co.th';

/** TODO: fill in real URLs — empty ones are not shown. */
export const SOCIAL_LINKS = {
  linkedin: '',
  facebook: '',
  instagram: '',
  youtube: '',
};

/** Footer / community links. Empty ones are hidden; community falls back to emailing the team. */
export const LINKS = {
  courses: '',
  blog: '',
  community: '',
};

/** Marketing numbers shown under the hero. TODO: make sure each one is true before launch. */
export const STATS = [
  { value: '1,000+', label: 'ร้านดอกไม้เริ่มต้นตั้งราคาขายอย่างถูกต้องด้วย ProfitBloom' },
  { value: '15–30%', label: 'เพิ่มกำไรเฉลี่ย 15–30% ภายใน 3 เดือน' },
  { value: '500+', label: 'Clients' },
  { value: '140', label: 'Project' },
];

export const HERO_BADGES = {
  projectsDone: '3,258',
  reviews: '20k+',
};

/**
 * Customer quotes. TODO: these are the placeholders from the design (Lorem ipsum) —
 * replace them with real reviews from real shops before the page goes live.
 */
export const TESTIMONIALS = [
  {
    quote: 'Lacus vestibulum ultricies mi risus, duis non, volutpat nullam non. Magna congue nisi maecenas elit aliquet eu sed consectetur. Vitae quis cras vitae praesent morbi adipiscing purus consectetur mi.',
    name: 'Hellen Jummy',
    role: 'Financial Counselor',
    avatar: '/landing/t1.webp',
  },
  {
    quote: 'Odio rhoncus ornare ut quam. Molestie vel duis quis scelerisque ut id. In tortor turpis viverra sagittis ultrices nisi, nec tortor. Vestibulum, ultrices ultricies neque, hac ultricies dolor.',
    name: 'Ralph Edwards',
    role: 'Math Teacher',
    avatar: '/landing/t2.webp',
  },
  {
    quote: 'Sagittis nunc egestas leo et malesuada urna risus. Morbi proin et cras aliquam. Diam tellus, amet, hac imperdiet. Tellus mi volutpat tellus, congue malesuada sit nisl donec a.',
    name: 'Hellena John',
    role: 'Psychology Student',
    avatar: '/landing/t3.webp',
  },
  {
    quote: 'Sapien amet, nulla consectetur aliquam. Neque in, sed nulla quis amet neque lorem. Pharetra nulla duis ultricies arcu et convallis lacus faucibus porta.',
    name: 'Customer Name',
    role: 'Shop Owner',
    avatar: '/landing/t4.webp',
  },
];

/** The plans on the website. The app's Packages page and the admin page read these too, so prices stay in one place. */
export const PLANS = [
  {
    id: 'trial' as const,
    name: 'Free Trial',
    yearly: 0,
    tagline: 'ทดลองใช้ฟีเจอร์ครบทุกอย่างเหมือน Pro แบบฟรี 30 วัน',
    price: 'ฟรี',
    priceNote: '30 วัน',
    priceSub: '(ครบฟีเจอร์ทุกอย่าง)',
    footnote: 'ไม่ต้องผูกบัตรเครดิต',
    cta: 'Start Free Trial',
    features: [
      'สำหรับร้านขนาดกลาง-ใหญ่ หรือทีมจัดงาน',
      'ระบบคำนวณต้นทุนต่อโปรเจกต์ (งานแต่ง/อีเวนต์)',
      'บันทึกต้นทุน vs ราคาขาย',
      'Dashboard รวมยอดขายรายปี',
      'เพิ่มผู้ใช้ได้ 5 คน',
      'Export ใบเสนอราคา + ใบสรุปต้นทุนครบชุด',
      'Customer Tracker + Loyalty Report',
      'ทีม Support ส่วนตัวทาง LINE OA VIP',
    ],
  },
  {
    id: 'starter' as const,
    name: 'Starter',
    yearly: 990,
    tagline: 'สำหรับธุรกิจดอกไม้และจัดงานที่ต้องการระบบบริหารจัดการที่ครบครันและง่ายต่อการใช้งาน',
    price: '฿990',
    priceNote: 'ต่อปี',
    priceSub: '(เฉลี่ย ฿82/เดือน)',
    footnote: 'จากราคา ฿1,590',
    cta: 'Choose plan',
    features: [
      'สำหรับเจ้าของร้านดอกไม้ขนาดเล็ก-กลาง',
      'ระบบคำนวณต้นทุน + ราคาขาย',
      'สินค้าไม่จำกัด',
      'บันทึกวัตถุดิบ/อุปกรณ์/ค่าแรง',
      'Export ใบเสนอราคาเป็น PDF',
      'Dashboard สรุปกำไรรายเดือน',
      'รองรับ 1 ผู้ใช้',
      'อัปเดตอัตโนมัติทุกเดือน',
    ],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    yearly: 1590,
    tagline: 'รองรับผู้ใช้งานหลายบัญชี\nดูรายงานวิเคราะห์เชิงลึก\nกำหนดราคาขายตามโปรเจกต์ได้',
    price: '฿1,590',
    priceNote: 'ต่อปี',
    priceSub: '(เฉลี่ย ฿132/เดือน)',
    footnote: 'จากราคา ฿2,190',
    cta: 'Choose plan',
    popular: true,
    features: [
      'สำหรับร้านขนาดกลาง-ใหญ่ หรือทีมจัดงาน',
      'ระบบคำนวณต้นทุนต่อโปรเจกต์ (งานแต่ง/อีเวนต์)',
      'บันทึกต้นทุน vs ราคาขาย',
      'Dashboard รวมยอดขายรายปี',
      'เพิ่มผู้ใช้ได้ 5 คน',
      'Export ใบเสนอราคา + ใบสรุปต้นทุนครบชุด',
      'Customer Tracker + Loyalty Report',
      'ทีม Support ส่วนตัวทาง LINE OA VIP',
    ],
  },
];
