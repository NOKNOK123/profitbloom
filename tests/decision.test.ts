// Checks the decision engine against the worked examples in the product vision deck.
// Run: node --test tests/decision.test.ts   (Node strips the TypeScript types itself)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canTakeJob,
  DEFAULT_RULES,
  health,
  learnings,
  markupToMargin,
  numbers,
  review,
  risks,
  simulate,
  type Job,
} from '../src/lib/decision.ts';

const job = (over: Partial<Job> = {}): Job => ({
  costItems: [],
  profitMargin: 0,
  budget: 0,
  depositPct: 50,
  setupDays: 1,
  eventDays: 1,
  laborDays: 2,
  teamSize: 4,
  ownerLabor: true,
  teardown: true,
  ...over,
});
const item = (name: string, category: any, amount: number, paidBefore = true, actual: number | null = null) => ({
  name, category, quantity: 1, price: amount, paidBefore, actual,
});
/** markup that turns `cost` into `price` */
const markup = (cost: number, price: number) => (price / cost - 1) * 100;
const near = (a: number, b: number, tol = 0.5) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test('margin is profit ÷ price, not the markup (slide 7: 280,000 / 205,000 → 26.8%)', () => {
  const j = job({ costItems: [item('รวม', 'material', 205000)], profitMargin: markup(205000, 280000) });
  const n = numbers(j);
  near(n.price, 280000);
  near(n.profit, 75000);
  near(n.margin, 26.8, 0.05);
  near(markupToMargin(30), 23.08, 0.01); // a 30% markup is only a 23% margin
});

test('Job Health Check: break-even and recommended range (slide 5: 238,000 → 315,000–365,000)', () => {
  const h = health(job({ costItems: [item('รวม', 'material', 238000)], profitMargin: markup(238000, 445000) }), DEFAULT_RULES);
  near(h.breakEven, 238000);
  near(h.recommended[0], 317333, 1); // 238,000 ÷ (1 − 25%)
  near(h.recommended[1], 366154, 1); // 238,000 ÷ (1 − 35%)
  near(h.margin, 46.5, 0.1);
  assert.equal(h.level, 'good');
});

test('Scenario Simulator (slide 6: 350,000 → 300,000, margin 46% → 37%, profit −50,000, max cost 180,000 at 40%)', () => {
  const cost = 350000 * 0.54; // 46% margin
  const j = job({ costItems: [item('รวม', 'material', cost)], profitMargin: markup(cost, 350000) });
  const r = simulate(j, { budgetCutPct: (50000 / 350000) * 100, materialUpPct: 0, extraTeam: 0, extraSetupDays: 0, extraVehicles: 0 }, { ...DEFAULT_RULES, goodMargin: 40 });
  near(r.after.price, 300000);
  near(r.before.margin, 46, 0.01);
  near(r.after.margin, 37, 0.01);
  near(r.profitChange, -50000);
  near(r.maxCostForTarget, 180000);
  assert.match(r.advice, /ยังรับได้ แต่ควรลดต้นทุนอีก 9,000 บาท/);
});

test('Scenario Simulator: margin under the shop minimum is called out as risky, not "still OK"', () => {
  const j = job({ costItems: [item('รวม', 'material', 65400)], profitMargin: markup(65400, 125769) });
  const r = simulate(j, { budgetCutPct: 33.33, materialUpPct: 0, extraTeam: 0, extraSetupDays: 0, extraVehicles: 0 }, DEFAULT_RULES);
  assert.ok(r.after.margin > 20 && r.after.margin < 25, String(r.after.margin));
  assert.match(r.advice, /^เสี่ยง — Margin ต่ำกว่าขั้นต่ำ 25%/);
});

test('Scenario Simulator adds team, setup day, vehicles and material price rises', () => {
  const j = job({ costItems: [item('ดอกไม้', 'material', 10000)], profitMargin: 100, teamSize: 2, setupDays: 1, eventDays: 1 });
  const r = simulate(j, { budgetCutPct: 0, materialUpPct: 20, extraTeam: 1, extraSetupDays: 1, extraVehicles: 1 }, DEFAULT_RULES);
  near(r.added.material, 2000);
  near(r.added.team, 1 * 2 * 800); // 1 person × 2 days
  near(r.added.setup, 1 * 3 * 800); // 1 day × 3 people
  near(r.added.vehicles, 2500);
});

test('Quote Health Check finds the four risks on slide 7', () => {
  const j = job({
    costItems: [item('ดอกไม้', 'material', 150000), item('ทีม', 'labor', 40000, false), item('รถ', 'transport', 15000, false)],
    profitMargin: markup(205000, 280000),
    depositPct: 30, // 84,000 deposit vs 150,000 paid before the event
    ownerLabor: false,
    teardown: false,
    setupDays: 2,
    eventDays: 1,
    laborDays: 1,
  });
  const ids = risks(j, DEFAULT_RULES).map((r) => r.id);
  for (const id of ['owner-labor', 'teardown', 'labor-days', 'cash-flow']) assert.ok(ids.includes(id), `missing ${id}: ${ids}`);
  assert.ok(risks(j, DEFAULT_RULES).find((r) => r.id === 'labor-days')!.title.includes('1 วัน แต่ Timeline 3 วัน'));
});

test('RULE 1 (slide 10): margin under 20% is High Risk', () => {
  const j = job({ costItems: [item('รวม', 'material', 100000)], profitMargin: markup(100000, 120000) }); // 16.7%
  const r = risks(j, DEFAULT_RULES).find((x) => x.id === 'margin-high-risk');
  assert.ok(r);
  assert.equal(r!.severity, 'high');
  assert.equal(health(j, DEFAULT_RULES).level, 'risk');
});

test('RULE 2 (slide 10): deposit below pre-event cash is a Cash Flow Warning', () => {
  const ok = job({ costItems: [item('ดอกไม้', 'material', 10000)], profitMargin: 100, depositPct: 50 }); // deposit 10,000 = cash 10,000
  const bad = { ...ok, depositPct: 40 };
  assert.ok(!risks(ok, DEFAULT_RULES).some((r) => r.id === 'cash-flow'));
  assert.ok(risks(bad, DEFAULT_RULES).some((r) => r.id === 'cash-flow'));
});

test('RULE 3 (slide 10) + Post-Event Review (slide 9: expected 98,000 → actual 61,500, lost 36,500)', () => {
  const cost = 280000 - 98000;
  const j = job({
    costItems: [
      { ...item('ดอกไม้', 'material', 100000), actual: 112000 },
      { ...item('ทีม', 'labor', 50000, false), actual: 58500 },
      { ...item('รถขนส่ง', 'transport', 32000, false), actual: 38000 },
      { name: 'ซื้อของหน้างาน', category: 'other', quantity: 0, price: 0, paidBefore: false, actual: 10000, isExtra: true },
    ],
    profitMargin: markup(cost, 280000),
  });
  const r = review(j, DEFAULT_RULES);
  near(r.expectedProfit, 98000);
  near(r.actualProfit, 61500);
  near(r.lost, 36500);
  assert.deepEqual(r.overruns.map((o) => [o.name, Math.round(o.diff)]), [
    ['ดอกไม้', 12000],
    ['ซื้อของหน้างาน', 10000],
    ['ทีม', 8500],
    ['รถขนส่ง', 6000],
  ]);
  near(r.laborOverrunPct, 17);
  assert.equal(r.laborOverrun, true); // 17% > 15%
});

test('Can I Take This Job?: take / adjust / risky', () => {
  const base = { budget: 100000, materials: 30000, rentals: 5000, teamSize: 3, workDays: 2, dailyWage: 800, ownerLabor: 3000, transport: 3000, teardownIncluded: true, depositPct: 50 };
  assert.equal(canTakeJob(base, DEFAULT_RULES).verdict, 'take'); // cost 45,800 → margin 54%
  assert.equal(canTakeJob({ ...base, ownerLabor: 0 }, DEFAULT_RULES).verdict, 'adjust'); // owner labour missing
  const tight = canTakeJob({ ...base, budget: 58000 }, DEFAULT_RULES); // margin 21% (between 20 and 25)
  assert.equal(tight.verdict, 'adjust');
  near(tight.minPrice, 45800 / 0.75, 1);
  assert.equal(canTakeJob({ ...base, budget: 50000 }, DEFAULT_RULES).verdict, 'risky'); // margin 8%
});

test('Learning loop: average overrun per category from reviewed jobs', () => {
  const a = job({ costItems: [{ ...item('ดอกไม้', 'material', 100), actual: 112 }, { ...item('ทีม', 'labor', 100, false), actual: 100 }] });
  const b = job({ costItems: [{ ...item('ดอกไม้', 'material', 100), actual: 108 }] });
  const l = learnings([a, b]);
  assert.equal(l.length, 1);
  assert.equal(l[0].category, 'material');
  near(l[0].overrunPct, 10);
  assert.equal(l[0].jobs, 2);
});
