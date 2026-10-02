import type { Project, User } from './api';
import { health, withDefaults, type Job, type Rules } from './decision';

/** The decision engine's view of a saved project. */
export function toJob(p: Project): Job {
  return {
    costItems: p.costItems.map((i) => ({
      name: i.name,
      category: i.category,
      quantity: i.quantity,
      price: i.price,
      paidBefore: i.paidBefore,
      actual: i.actual,
      isExtra: i.isExtra,
    })),
    profitMargin: p.profitMargin,
    budget: p.budget,
    depositPct: p.depositPct,
    setupDays: p.setupDays,
    eventDays: p.eventDays,
    laborDays: p.laborDays,
    teamSize: p.teamSize,
    ownerLabor: p.ownerLabor,
    teardown: p.teardown,
  };
}

export const rulesOf = (user: User): Rules => withDefaults(user.rules);

export const projectHealth = (p: Project, user: User) => health(toJob(p), rulesOf(user));

export const LEVEL_STYLE = {
  good: { ring: '#16a34a', chip: 'bg-emerald-50 text-emerald-700' },
  watch: { ring: '#d97706', chip: 'bg-amber-50 text-amber-700' },
  risk: { ring: '#e11d48', chip: 'bg-rose-50 text-rose-600' },
} as const;
