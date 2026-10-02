import { PLANS } from '../landing/content';
import type { User } from './api';

export type PlanId = User['plan'];

export const planInfo = (id: PlanId) => PLANS.find((p) => p.id === id) ?? PLANS[0];
export const planName = (id: PlanId) => planInfo(id).name;

/** Whole days left on the free trial (0 once it has ended), or null when the shop isn't on the trial. */
export function trialDaysLeft(user: Pick<User, 'plan' | 'trialEndsAt'>): number | null {
  if (user.plan !== 'trial' || !user.trialEndsAt) return null;
  return Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / 864e5));
}

export const thaiDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
