import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fmtINR, fmtHours, calcBill } from '../../utils';
import { LineChart } from '../../components/charts/LineChart';
import type { ChartData } from 'chart.js';
import type { TimesheetEntry } from '../../types';

function getAccHrs(entries: TimesheetEntry[], date: string, startTime: string): number {
  return entries
    .filter(e => e.date === date && e.startTime < startTime)
    .reduce((s, e) => s + (Number(e.hoursDecimal) || 0), 0);
}

type RevPeriod = '7' | '30' | 'all';

export function AnalyticsPage({ active }: { active: boolean }) {
  const { state } = useApp();
  const [revPeriod, setRevPeriod] = useState<RevPeriod>('7');

  const analytics = useMemo(() => {
    let totalRev = 0, totalHrs = 0, totalShifts = 0, totalOT = 0;
    const dailyRevMap: Record<string, number> = {};

    state.cranes.forEach(crane => {
      const op = crane.operator;
      const opTs: TimesheetEntry[] = (op ? state.timesheets[op] : undefined) || [];
      opTs.forEach(e => {
        const h = Number(e.hoursDecimal) || 0;
        const b = calcBill(h, crane, getAccHrs(opTs, e.date, e.startTime));
        const rev = b ? b.total : 0;
        totalRev += rev;
        totalHrs += h;
        totalShifts++;
        if (b && b.hasOT) totalOT++;
        const k = e.date;
        if (!dailyRevMap[k]) dailyRevMap[k] = 0;
        dailyRevMap[k] += rev;
      });
    });

    const deployed = state.cranes.filter(c => c.operator).length;
    const utilPct = state.cranes.length ? Math.round(deployed / state.cranes.length * 100) : 0;

    // Top earners by crane
    const earners = state.cranes.map(crane => {
      const op = crane.operator;
      const opTs: TimesheetEntry[] = (op ? state.timesheets[op] : undefined) || [];
      let rev = 0;
      opTs.forEach(e => {
        const h = Number(e.hoursDecimal) || 0;
        const b = calcBill(h, crane, getAccHrs(opTs, e.date, e.startTime));
        if (b) rev += b.total;
      });
      return { crane, rev };
    }).sort((a, b) => b.rev - a.rev).slice(0, 5);

    // Operator performance
    const perfRows = state.operators.map(op => {
      const crane = state.cranes.find(c => c.operator === op.phone || c.operator === op.id);
      const opTs: TimesheetEntry[] = (state.timesheets[op.phone] || state.timesheets[op.id] || []);
      let shifts = 0, hrs = 0, otShifts = 0, rev = 0;
      opTs.forEach(e => {
        const h = Number(e.hoursDecimal) || 0;
        shifts++;
        hrs += h;
        const b = crane ? calcBill(h, crane, getAccHrs(opTs, e.date, e.startTime)) : null;
        if (b) { rev += b.total; if (b.hasOT) otShifts++; }
      });
      return { op, crane, shifts, hrs, otShifts, rev };
    }).sort((a, b) => b.rev - a.rev);

    return { totalRev, totalHrs, totalShifts, totalOT, dailyRevMap, deployed, utilPct, earners, perfRows };
  }, [state.cranes, state.operators, state.timesheets]);

  const revChartData = useMemo((): ChartData<'line'> => {
    const days = revPeriod === 'all'
      ? Math.max(30, Object.keys(analytics.dailyRevMap).length + 7)
      : Number(revPeriod);
    const pts: Array<{ l: string; v: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      pts.push({ l: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), v: analytics.dailyRevMap[iso] || 0 });
    }
    return {
      labels: pts.map(p => p.l),
      datasets: [{
        data: pts.map(p => p.v),
        fill: false,
        borderColor: 'var(--accent)',
        borderWidth: 1.5,
        tension: 0.4,
        pointRadius: pts.length > 14 ? 0 : 3,
      }],
    };
  }, [analytics.dailyRevMap, revPeriod]);

  return (
    <div className={`page ${active ? 'active' : ''}`} id="page-analytics">
      {/* KPI grid */}
      <div className="kpi-grid" id="kpi-analytics">
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'var(--accent-s)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-label">Fleet Revenue</div>
            <div className="kpi-val" style={{ color: 'var(--accent)' }}>
              {analytics.totalRev >= 100000 ? `₹${(analytics.totalRev / 100000).toFixed(1)}L` : fmtINR(analytics.totalRev)}
            </div>
            <div className="kpi-sub">{analytics.totalShifts} shifts · {fmtHours(analytics.totalHrs)}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'var(--green-s)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-label">Total Hours</div>
            <div className="kpi-val" style={{ color: 'var(--green)' }}>{fmtHours(analytics.totalHrs)}</div>
            <div className="kpi-sub">{analytics.totalOT} OT shifts</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'var(--amber-s)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round">
                <path d="M2 20h20" /><path d="M10 4v16" /><path d="M10 4l8 4" /><path d="M18 8v12" />
              </svg>
            </div>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-label">Utilisation</div>
            <div className="kpi-val" style={{ color: 'var(--amber)' }}>{analytics.utilPct}%</div>
            <div className="kpi-sub">{analytics.deployed} of {state.cranes.length} active</div>
          </div>
        </div>
      </div>

      {/* Revenue trend chart */}
      <div className="a-grid-2">
        <div className="chart-card">
          <div className="card-head">
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-sub" id="rev-chart-sub">Daily fleet earnings</div>
            </div>
            <div className="chart-tabs" id="rev-tabs">
              {(['7', '30', 'all'] as RevPeriod[]).map(p => (
                <button
                  key={p}
                  className={`ctab${revPeriod === p ? ' active' : ''}`}
                  data-period={p}
                  onClick={() => setRevPeriod(p)}
                >
                  {p === 'all' ? 'All' : `${p}D`}
                </button>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: '200px' }}>
            <LineChart data={revChartData} height={200} />
          </div>
        </div>

        {/* Top earners */}
        <div className="chart-card" style={{ paddingBottom: '12px' }}>
          <div className="card-head">
            <div>
              <div className="card-title">Top Earners</div>
              <div className="card-sub">By total revenue</div>
            </div>
          </div>
          <div id="earners-list">
            {analytics.earners.length === 0 ? (
              <p className="empty-msg" style={{ fontSize: '11px' }}>No revenue data yet</p>
            ) : (
              analytics.earners.map(({ crane, rev }, i) => (
                <div key={crane.reg} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--fh)', color: 'var(--t4)', width: '14px' }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{crane.reg}</div>
                    <div style={{ fontSize: '9px', color: 'var(--t3)' }}>{[crane.make, crane.model].filter(Boolean).join(' ')}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--fh)', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{fmtINR(rev)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Operator performance */}
      <div className="chart-card">
        <div className="card-head">
          <div className="card-title">Operator Performance</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" id="perf-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Asset</th>
                <th>Shifts</th>
                <th>Hours</th>
                <th>OT</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody id="perf-table-body">
              {analytics.perfRows.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--t4)', fontSize: '11px' }}>No data</td></tr>
              ) : (
                analytics.perfRows.map(({ op, crane, shifts, hrs, otShifts, rev }) => (
                  <tr key={op.id}>
                    <td style={{ fontWeight: 600 }}>{op.name}</td>
                    <td>{crane ? crane.reg : <span style={{ color: 'var(--t4)' }}>—</span>}</td>
                    <td>{shifts}</td>
                    <td>{fmtHours(hrs)}</td>
                    <td>{otShifts || <span style={{ color: 'var(--t4)' }}>—</span>}</td>
                    <td>{rev > 0 ? <span style={{ color: 'var(--accent)' }}>{fmtINR(rev)}</span> : <span style={{ color: 'var(--t4)' }}>—</span>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
