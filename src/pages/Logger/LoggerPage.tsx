import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calcHours, fmtHours, calcBill, fmtINR, todayISO, todayStr } from '../../utils';
import { api } from '../../services/api';
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

export function LoggerPage({ active }: { active: boolean }) {
  const { state, setState, showToast, user } = useApp();
  const { cranes, timesheets, operatorProfiles, files } = state;

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');

  const assigned = cranes.find(c => c.operator === user);
  const profile = user ? (operatorProfiles[user] || {}) : {};
  const myTs: TimesheetEntry[] = user ? (timesheets[user] || []) : [];
  const myFiles: unknown[] = user ? (files[user] || []) : [];

  const h = calcHours(startTime, endTime);
  const bill = assigned && assigned.rate && h && h > 0
    ? calcBill(h, assigned, getAccHrs(myTs, todayStr(), startTime))
    : null;

  const handleCommit = async () => {
    if (!startTime || !endTime) return showToast('Set start and end times', 'error');
    if (!h || h <= 0) return showToast('Invalid time range', 'error');
    const entryId = String(Date.now());
    const dateISO = todayISO();
    const entry: TimesheetEntry = {
      id: entryId,
      date: dateISO,
      startTime,
      endTime,
      hoursDecimal: h,
      operatorId: user || undefined,
      notes,
    };
    setState(prev => {
      const uid = user || '';
      const existing = prev.timesheets[uid] || [];
      const newAttendance = [...prev.attendance];
      const existingAtt = newAttendance.findIndex(a => a.operator_key === uid && a.date === dateISO);
      
      const attRecord = {
        id: `auto-${Date.now()}`,
        operator_key: uid,
        date: dateISO,
        status: 'present',
        marked_by: 'operator'
      };

      if (existingAtt >= 0) {
        newAttendance[existingAtt] = { ...newAttendance[existingAtt], status: 'present' };
      } else {
        newAttendance.push(attRecord);
      }

      return {
        ...prev,
        timesheets: {
          ...prev.timesheets,
          [uid]: [entry, ...existing],
        },
        attendance: newAttendance,
      };
    });
    setNotes('');
    const billMsg = bill ? ` · ${fmtINR(bill.total)}` : '';
    showToast(`Logged: ${fmt12(startTime)} → ${fmt12(endTime)}${billMsg}`);
    if (bill?.hasOT) showToast(`OT: +${fmtHours(bill.otH)}`, 'warn');
    // Persist to backend
    try {
      await api.createTimesheet({
        crane_reg: assigned?.reg || '',
        operator_key: user || '',
        date: dateISO,
        start_time: startTime,
        end_time: endTime,
        hours_decimal: h,
        operator_id: user || undefined,
        notes,
      });
    } catch {
      showToast('Failed to sync to server', 'error');
    }
  };

  // Recalc on time changes (no-op — bill is derived reactively)
  useEffect(() => { /* reactive */ }, [startTime, endTime]);

  const todayISO_ = todayISO();
  const todayEntries = myTs.filter(e => e.date === todayISO_);

  return (
    <div className={`page ${active ? 'active' : ''}`} id="page-logger">
      {/* Hero assignment strip */}
      <div className="op-hero">
        <div className="op-assign-label">Current Assignment</div>
        <div className="op-assign-reg" id="op-reg">{assigned ? assigned.reg : 'NONE'}</div>
        {(profile as { name?: string; licence?: string }).name && (
          <div className="op-profile-strip">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)' }}>{(profile as { name?: string }).name}</span>
            {(profile as { licence?: string }).licence && (
              <span style={{ background: 'var(--accent-s)', color: 'var(--accent)', border: '1px solid var(--accent-g)', borderRadius: 'var(--rf)', padding: '3px 10px', fontSize: 9 }}>
                {(profile as { licence?: string }).licence}
              </span>
            )}
          </div>
        )}
        {assigned && assigned.rate && (
          <div id="op-rate-pill">
            <span className="op-rate-pill">
              ₹{Number(assigned.rate).toLocaleString('en-IN')}/hr · Limit: {assigned.dailyLimit || 8}h · OT: ₹{Number(assigned.otRate || assigned.rate).toLocaleString('en-IN')}/hr
            </span>
          </div>
        )}
        {!assigned && (
          <div style={{ display: 'block', fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>
            No equipment assigned — contact dispatch.
          </div>
        )}
      </div>

      {/* Logger card */}
      <div className="logger-card">
        <div className="logger-title">Shift Logger</div>
        <div className="time-row">
          <div>
            <div className="time-label">Start Time</div>
            <div className="time-box">
              <svg width="15" height="15" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="time-label">End Time</div>
            <div className="time-box">
              <svg width="15" height="15" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Bill preview */}
        {bill && (
          <div className="bill-preview show">
            <div className="bp-label">Live Invoice Estimate</div>
            <div className="bp-total">{fmtINR(bill.total)}</div>
            <div className="bp-rows">
              <div className="bp-row"><span>STD ({fmtHours(bill.stdH)} × {fmtINR(bill.rate)})</span><span>{fmtINR(bill.standard)}</span></div>
              {bill.hasOT && <div className="bp-row ot"><span>OT ({fmtHours(bill.otH)} × {fmtINR(bill.otRate)})</span><span>{fmtINR(bill.ot)}</span></div>}
              <div className="bp-row total"><span>TOTAL</span><span>{fmtINR(bill.total)}</span></div>
            </div>
          </div>
        )}
        {h && h > 0 && !bill && (
          <div className="bill-preview show">
            <div className="bp-label">Hours Calculated</div>
            <div className="bp-total">{fmtHours(h)}</div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginTop: 12 }}>
          <div className="time-label" style={{ marginBottom: 5 }}>
            Shift Remarks <span style={{ fontSize: 8, color: 'var(--t4)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional)</span>
          </div>
          <textarea
            className="notes-area"
            rows={2}
            placeholder="Site, job details, supervisor…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button className="btn-primary" style={{ marginTop: 10 }} onClick={handleCommit}>
          Commit Log Entry
        </button>

        {/* Record count */}
        <div style={{ fontSize: 9, color: 'var(--t3)', textAlign: 'center', marginTop: 10 }}>
          {(myTs.length + myFiles.length) > 0 ? `[ ${myTs.length + myFiles.length} RECORDS SYNCED ]` : ''}
        </div>
      </div>

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', marginBottom: 8 }}>
            Today's Entries ({todayEntries.length})
          </div>
          <div className="bill-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Start</th><th>End</th><th>Hours</th>{assigned?.rate && <th>Bill</th>}<th>Remarks</th></tr>
              </thead>
              <tbody>
                {todayEntries.map(e => {
                  const eh = Number(e.hoursDecimal) || 0;
                  const eb = assigned?.rate ? calcBill(eh, assigned, getAccHrs(myTs, e.date, e.startTime)) : null;
                  return (
                    <tr key={e.id}>
                      <td>{fmt12(e.startTime)}</td>
                      <td>{fmt12(e.endTime)}</td>
                      <td><span className="hours-badge">{fmtHours(eh)}</span></td>
                      {assigned?.rate && <td><span className="bill-badge">{eb ? fmtINR(eb.total) : '—'}</span></td>}
                      <td style={{ fontSize: 10, color: 'var(--t2)' }}>{e.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
