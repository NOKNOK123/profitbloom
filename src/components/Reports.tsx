import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Wallet, FolderOpen } from 'lucide-react';
import { SalesChart } from './SalesChart';
import { StatsCard } from './StatsCard';
import { api, baht, type Project, Reports as ReportsData, type User } from '../lib/api';
import { review } from '../lib/decision';
import { rulesOf, toJob } from '../lib/job';

interface ReportsProps {
  user: User;
  onOpenProject: (p: Project) => void;
}

export function Reports({ user, onOpenProject }: ReportsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [data, setData] = useState<ReportsData | null>(null);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

  useEffect(() => {
    api.reports().then(setData).catch((err) => setError(err.message));
    api.projects().then(setProjects).catch(() => {});
  }, []);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center text-ink">กำลังโหลด...</div>;

  // Margin = profit ÷ sales (not ÷ cost, which would be the markup)
  const margin = data.totals.sales > 0 ? (data.totals.profit / data.totals.sales) * 100 : 0;
  const rules = rulesOf(user);
  const actuals = projects
    .map((p) => ({ p, r: review(toJob(p), rules) }))
    .filter(({ r }) => r.recorded);
  const lostTotal = actuals.reduce((s, { r }) => s + r.lost, 0);
  const maxStatus = Math.max(1, ...data.byStatus.map((s) => s.count));

  return (
    <div>
      <div className="p-5 md:p-10 pb-28 md:pb-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-[28px] font-semibold text-ink tracking-tight">รายงาน</h1>
          <p className="text-sm text-ink-muted mt-1">สรุปยอดขายและกำไรจากโปรเจ็กต์ที่อนุมัติ/เสร็จสิ้นแล้วทั้งหมด</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <StatsCard icon={DollarSign} iconBg="bg-violet-50 text-[#673AB7]" value={baht(data.totals.sales)} label="ยอดขายรวม" change="ทุกช่วงเวลา" positive />
          <StatsCard icon={TrendingUp} iconBg="bg-amber-50 text-amber-500" value={baht(data.totals.profit)} label="กำไรรวม" change={`Margin เฉลี่ย ${margin.toFixed(1)}%`} positive />
          <StatsCard icon={Wallet} iconBg="bg-violet-50 text-[#673AB7]" value={baht(data.totals.cost)} label="ต้นทุนรวม" change="จากรายการต้นทุน" positive />
          <StatsCard icon={FolderOpen} iconBg="bg-amber-50 text-amber-500" value={String(data.totals.projects)} label="โปรเจ็กต์ทั้งหมด" change="ทุกสถานะ" positive />
        </div>

        <div className="pb-card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl text-ink-muted mb-1 font-semibold">ยอดขายและกำไร 12 เดือนล่าสุด</h3>
              <p className="text-sm text-ink-muted">นับตามวันที่จัดงาน</p>
            </div>
            <div className="flex bg-canvas rounded-full p-1">
              {(['line', 'bar'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${chartType === t ? 'bg-white text-ink shadow-card font-medium' : 'text-ink-muted hover:text-ink'}`}
                >
                  {t === 'line' ? 'เส้น' : 'แท่ง'}
                </button>
              ))}
            </div>
          </div>
          <SalesChart chartType={chartType} data={data.chart} />
        </div>

        <div className="pb-card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-5">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-ink">ประมาณการ vs เกิดขึ้นจริง</h3>
              <p className="text-sm text-ink-muted">งานที่กรอกต้นทุนจริงแล้ว — ดูว่ากำไรหายไปตรงไหน</p>
            </div>
            {actuals.length > 0 && (
              <p className={`text-sm font-semibold ${lostTotal > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {lostTotal > 0 ? `กำไรหายไปรวม ${baht(lostTotal)}` : `กำไรเกินคาดรวม ${baht(-lostTotal)}`}
              </p>
            )}
          </div>
          {actuals.length === 0 ? (
            <p className="text-sm text-ink-muted">ยังไม่มีงานที่กรอกต้นทุนจริง — กรอกได้ในงานแต่ละงาน ขั้น "ติดตามต้นทุนจริง"</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-muted border-b border-line">
                    <th className="py-2.5 pr-3 font-medium">งาน</th>
                    <th className="py-2.5 px-3 font-medium text-right">ราคาเสนอ</th>
                    <th className="py-2.5 px-3 font-medium text-right">กำไรที่คาด</th>
                    <th className="py-2.5 px-3 font-medium text-right">กำไรจริง</th>
                    <th className="py-2.5 pl-3 font-medium">สาเหตุหลัก</th>
                  </tr>
                </thead>
                <tbody>
                  {actuals.map(({ p, r }) => (
                    <tr key={p.id} className="border-b border-line last:border-0 hover:bg-[#FBFAFD] cursor-pointer" onClick={() => onOpenProject(p)}>
                      <td className="py-3 pr-3 text-ink font-medium">{p.title}</td>
                      <td className="py-3 px-3 text-right">{baht(r.quoted)}</td>
                      <td className="py-3 px-3 text-right">{baht(r.expectedProfit)}</td>
                      <td className={`py-3 px-3 text-right font-semibold ${r.actualProfit < r.expectedProfit ? 'text-rose-600' : 'text-emerald-600'}`}>{baht(r.actualProfit)}</td>
                      <td className="py-3 pl-3 text-ink-muted">{r.overruns[0] ? `${r.overruns[0].name} +${baht(r.overruns[0].diff)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="pb-card lg:col-span-2 p-6 md:p-8">
            <h3 className="text-xl text-ink-muted mb-6 font-semibold">แยกตามประเภทงาน</h3>
            {data.byType.length === 0 ? (
              <p className="text-sm text-ink-muted">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-canvas/60 border-b border-line text-ink">
                      <th className="text-left p-3 font-medium">ประเภท</th>
                      <th className="text-right p-3 font-medium">โปรเจ็กต์</th>
                      <th className="text-right p-3 font-medium">ปิดการขาย</th>
                      <th className="text-right p-3 font-medium">ยอดขาย</th>
                      <th className="text-right p-3 font-medium">กำไร</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byType.map((t) => (
                      <tr key={t.type} className="border-b border-line">
                        <td className="p-3 text-ink-muted">{t.type}</td>
                        <td className="p-3 text-right">{t.projects}</td>
                        <td className="p-3 text-right">{t.sold}</td>
                        <td className="p-3 text-right text-ink font-medium">{baht(t.sales)}</td>
                        <td className="p-3 text-right text-emerald-600 font-medium">{baht(t.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pb-card p-6 md:p-8">
            <h3 className="text-xl text-ink-muted mb-6 font-semibold">โปรเจ็กต์ตามสถานะ</h3>
            <div className="space-y-4">
              {data.byStatus.map((s) => (
                <div key={s.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-muted">{s.statusText}</span>
                    <span className="text-ink font-medium">{s.count}</span>
                  </div>
                  <div className="w-full bg-[#F1F0F5] rounded-full h-1.5">
                    <div className="bg-[#673AB7] h-1.5 rounded-full" style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
