import { useApp } from '../../context/AppContext';
import { calcBill, fmtINR, fmtHours, todayISO } from '../../utils';
import type { TimesheetEntry } from '../../types';

function fmt12(t: string): string {
  if (!t) return '—';
  const [hh, mm] = t.split(':').map(Number);
  return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`;
}

function getAccHrs(ts: TimesheetEntry[], date: string, startTime: string): number {
  return ts
    .filter(e => e.date === date && e.startTime < startTime)
    .reduce((s, e) => s + (Number(e.hoursDecimal) || 0), 0);
}

export function OpHistoryPage({ active }: { active: boolean }) {
  const { state, setState, showToast, save, user } = useApp();
  const { timesheets, cranes, files } = state;

  const myTs: TimesheetEntry[] = user ? (timesheets[user] || []) : [];
  const myFiles: unknown[] = user ? (files[user] || []) : [];
  const crane = cranes.find(c => c.operator === user);
  const hasRate = !!(crane && crane.rate);

  const deleteEntry = (id: string) => {
    if (!confirm('Remove this entry?')) return;
    setState(prev => {
      const uid = user || '';
      return {
        ...prev,
        timesheets: {
          ...prev.timesheets,
          [uid]: (prev.timesheets[uid] || []).filter(e => e.id !== id),
        },
      };
    });
    save();
  };

  const exportXlsx = () => {
    if (!XLSX) return showToast('XLSX library missing', 'error');
    const wb = XLSX.utils.book_new();
    const td: unknown[][] = [['Date', 'Start', 'End', 'Hours', 'Bill (₹)', 'OT', 'Asset', 'Remarks']];
    myTs.forEach(e => {
      const h = Number(e.hoursDecimal) || 0;
      const b = hasRate && crane ? calcBill(h, crane, getAccHrs(myTs, e.date, e.startTime)) : null;
      td.push([e.date, fmt12(e.startTime), fmt12(e.endTime), fmtHours(h), b ? b.total : '—', (e as TimesheetEntry & { hasOT?: boolean }).hasOT ? 'Yes' : 'No', (e as TimesheetEntry & { craneReg?: string }).craneReg || '—', e.notes || '']);
    });
    const ws1 = XLSX.utils.aoa_to_sheet(td);
    XLSX.utils.book_append_sheet(wb, ws1, 'Timesheets');
    const fd: unknown[][] = [['File', 'Type', 'Size', 'Uploaded']];
    (myFiles as Array<{ name: string; type: string; size: string; timestamp: string }>).forEach(f => fd.push([f.name, f.type, f.size, f.timestamp]));
    const ws2 = XLSX.utils.aoa_to_sheet(fd);
    XLSX.utils.book_append_sheet(wb, ws2, 'Files');
    XLSX.writeFile(wb, `${user}_${todayISO()}.xlsx`);
    showToast('Exported successfully.');
  };

  return (
    <div className={`page ${active ? 'active' : ''}`} id="page-op-history">
      <div className="section-bar" style={{ marginBottom: 14 }}>
        <div className="section-title">My Shift History</div>
        <button className="btn-sm green" onClick={exportXlsx}>
          <svg width="11" height="11" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {' '}Export
        </button>
      </div>

      <div id="op-history-content">
        {!myTs.length ? (
          <p className="empty-msg">No shift history yet.</p>
        ) : (
          <div className="bill-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Hours</th>
                  {hasRate && <th>Bill</th>}
                  <th>Remarks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {myTs.map(e => {
                  const eh = Number(e.hoursDecimal) || 0;
                  const b = hasRate && crane ? calcBill(eh, crane, getAccHrs(myTs, e.date, e.startTime)) : null;
                  return (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 700 }}>{e.date}</td>
                      <td>{fmt12(e.startTime)}</td>
                      <td>{fmt12(e.endTime)}</td>
                      <td>
                        <span className="hours-badge">{fmtHours(eh)}</span>
                        {(e as TimesheetEntry & { hasOT?: boolean }).hasOT && <span className="ot-badge"> OT</span>}
                      </td>
                      {hasRate && <td><span className="bill-badge">{b ? fmtINR(b.total) : '—'}</span></td>}
                      <td style={{ fontSize: 10, color: 'var(--t2)', maxWidth: 130, whiteSpace: 'normal' }}>{e.notes || '—'}</td>
                      <td>
                        <button
                          className="btn-icon-sm red"
                          style={{ width: 26, height: 26 }}
                          onClick={() => deleteEntry(e.id)}
                          title="Delete entry"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
