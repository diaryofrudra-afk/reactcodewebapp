import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SearchBar } from '../../components/ui/SearchBar';
import { Modal } from '../../components/ui/Modal';
import { fmtINR, fmtHours, calcBill } from '../../utils';
import type { Operator, TimesheetEntry } from '../../types';

function getAccHrs(entries: TimesheetEntry[], date: string, startTime: string): number {
  return entries
    .filter(e => e.date === date && e.startTime < startTime)
    .reduce((s, e) => s + (Number(e.hoursDecimal) || 0), 0);
}

const BLANK_FORM = { name: '', phone: '', license: '', aadhaar: '' };

export function OperatorsPage({ active }: { active: boolean }) {
  const { state, setState, save, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return state.operators.filter(op => {
      return !q
        || op.name.toLowerCase().includes(q)
        || op.phone.includes(q)
        || (op.license || '').toLowerCase().includes(q)
        || (op.aadhaar || '').includes(q);
    });
  }, [state.operators, search]);

  function openAdd() {
    setForm({ ...BLANK_FORM });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const op = state.operators.find(o => o.id === id);
    if (!op) return;
    setForm({
      name: op.name,
      phone: op.phone,
      license: op.license || '',
      aadhaar: op.aadhaar || '',
    });
    setEditId(id);
    setModalOpen(true);
  }

  function handleSave() {
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (!name) return showToast('Name required', 'error');
    if (!phone) return showToast('Phone required', 'error');

    if (editId) {
      setState(prev => ({
        ...prev,
        operators: prev.operators.map(o =>
          o.id === editId
            ? { ...o, name, phone, license: form.license.trim(), aadhaar: form.aadhaar.trim() }
            : o
        ),
      }));
      showToast('Operator updated');
    } else {
      if (state.operators.find(o => o.phone === phone)) return showToast('Phone already registered', 'error');
      const newOp: Operator = {
        id: String(Date.now()),
        name,
        phone,
        license: form.license.trim(),
        aadhaar: form.aadhaar.trim(),
        status: 'active',
      };
      setState(prev => ({ ...prev, operators: [...prev.operators, newOp] }));
      showToast(`${name} added`);
    }
    save();
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    const op = state.operators.find(o => o.id === id);
    if (!op) return;
    if (!confirm(`Delete operator ${op.name}?`)) return;
    setState(prev => ({ ...prev, operators: prev.operators.filter(o => o.id !== id) }));
    save();
    showToast(`${op.name} deleted`, 'info');
  }

  function f(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  return (
    <div className={`page ${active ? 'active' : ''}`} id="page-operators">
      <div className="section-bar" style={{ marginBottom: '16px' }}>
        <div className="section-title">Operators</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, phone…" id="operators-search" />
          <button className="tb-btn accent" onClick={openAdd}>
            <svg width="11" height="11" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Operator
          </button>
        </div>
      </div>

      <div id="operators-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <h4>No Operators</h4>
            <p>{search ? 'No matches found' : 'Register your first operator'}</p>
          </div>
        ) : (
          filtered.map(op => {
            const crane = state.cranes.find(c => c.operator === op.id || c.operator === op.phone);
            const opTs: TimesheetEntry[] = (state.timesheets[op.phone] || state.timesheets[op.id] || []);
            const initials = op.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || op.phone.slice(-2);
            let totHrs = 0, totRev = 0;
            opTs.forEach(e => {
              const h = Number(e.hoursDecimal) || 0;
              const b = crane ? calcBill(h, crane, getAccHrs(opTs, e.date, e.startTime)) : null;
              totHrs += h;
              if (b) totRev += b.total;
            });
            return (
              <div key={op.id} className="op-row">
                <div className="op-row-av">{initials}</div>
                <div className="op-row-info">
                  <div className="op-row-name">{op.name}</div>
                  <div className="op-row-meta">
                    <span style={{ fontFamily: 'var(--fm)' }}>{op.phone}</span>
                    {op.license && (
                      <span style={{ background: 'var(--accent-s)', color: 'var(--accent)', border: '1px solid var(--accent-g)', borderRadius: 'var(--rf)', padding: '1px 7px', fontSize: '9px' }}>
                        {op.license}
                      </span>
                    )}
                    {crane ? <span className="badge accent">→ {crane.reg}</span> : <span className="badge">Unassigned</span>}
                    {opTs.length > 0 && <span className="badge">{opTs.length} shifts · {fmtHours(totHrs)}</span>}
                    {totRev > 0 && <span className="badge green">{fmtINR(totRev)}</span>}
                  </div>
                </div>
                <div className="op-row-right">
                  <button className="ca-btn c-acc opr-edit" title="Edit" onClick={() => openEdit(op.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button className="ca-btn c-red opr-del" title="Delete" onClick={() => handleDelete(op.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" /><path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Operator' : 'Add Operator'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label className="lbl">Name *</label>
          <input className="inp" placeholder="Full name" value={form.name} onChange={e => f('name', e.target.value)} />
          <label className="lbl">Phone *</label>
          <input className="inp" placeholder="10-digit phone" value={form.phone} onChange={e => f('phone', e.target.value)} />
          <label className="lbl">License No.</label>
          <input className="inp" placeholder="DL number" value={form.license} onChange={e => f('license', e.target.value)} />
          <label className="lbl">Aadhaar No.</label>
          <input className="inp" placeholder="Aadhaar number" value={form.aadhaar} onChange={e => f('aadhaar', e.target.value)} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button className="btn-sm accent" onClick={handleSave}>{editId ? 'Save Changes' : 'Add Operator'}</button>
            <button className="btn-sm outline" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
