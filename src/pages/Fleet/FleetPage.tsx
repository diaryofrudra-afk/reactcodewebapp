import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SearchBar } from '../../components/ui/SearchBar';
import { VehicleCard } from './VehicleCard';
import { getExpiryStatus } from '../../utils';
import type { TimesheetEntry } from '../../types';

type FleetFilter = 'all' | 'assigned' | 'unassigned' | 'alert';

function getComplianceAlerts(reg: string, compliance: Record<string, { insurance?: { date: string }; rto?: { date: string }; fitness?: { date: string } }>): string[] {
  const c = compliance[reg] || {};
  const alerts: string[] = [];
  const items: Array<[string, { date: string } | undefined]> = [
    ['Insurance', c.insurance],
    ['RTO', c.rto],
    ['Fitness', c.fitness],
  ];
  items.forEach(([label, v]) => {
    if (!v) return;
    const s = getExpiryStatus(v.date);
    if (s.c === 'expired') alerts.push(`${label} expired`);
    else if (s.c === 'warn') alerts.push(`${label}: ${s.l}`);
  });
  return alerts;
}

export function FleetPage({ active }: { active: boolean }) {
  const { state, setState, save, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FleetFilter>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return state.cranes.filter(c => {
      const profile = state.operatorProfiles[c.operator || ''] || {};
      const profileName = (profile as { name?: string }).name || '';
      const ms = !q
        || c.reg.toLowerCase().includes(q)
        || (c.make || '').toLowerCase().includes(q)
        || (c.operator || '').includes(q)
        || profileName.toLowerCase().includes(q);

      const alerts = getComplianceAlerts(c.reg, state.compliance);
      const mf =
        filter === 'all' ? true
          : filter === 'assigned' ? !!c.operator
            : filter === 'unassigned' ? !c.operator
              : filter === 'alert' ? alerts.length > 0
                : true;
      return ms && mf;
    });
  }, [state.cranes, state.operatorProfiles, state.compliance, search, filter]);

  function handleAssign(reg: string) {
    const crane = state.cranes.find(c => c.reg === reg);
    if (!crane) return;
    // Simple toggle: clear operator assignment (full assign UI is in a separate overlay)
    setState(prev => ({
      ...prev,
      cranes: prev.cranes.map(c =>
        c.reg === reg ? { ...c, operator: '' } : c
      ),
    }));
    save();
    showToast(`${reg} returned to standby`, 'info');
  }

  function handleDelete(reg: string) {
    if (!confirm(`Delete asset ${reg}?`)) return;
    setState(prev => ({
      ...prev,
      cranes: prev.cranes.filter(c => c.reg !== reg),
    }));
    save();
    showToast(`${reg} deleted`, 'info');
  }

  const filterPills: Array<{ key: FleetFilter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'assigned', label: 'Active' },
    { key: 'unassigned', label: 'Standby' },
    { key: 'alert', label: '⚠ Alerts' },
  ];

  return (
    <div className={`page ${active ? 'active' : ''}`} id="page-fleet">
      <div className="section-bar">
        <div className="section-title">Fleet Deployment</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search assets, operators…"
            id="fleet-search"
          />
          <button className="tb-btn accent" onClick={() => showToast('Use Assets page to add assets', 'info')}>
            <svg width="11" height="11" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Asset
          </button>
          <button className="tb-btn accent" onClick={() => showToast('Use Operators page to add operators', 'info')}>
            <svg width="11" height="11" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Operator
          </button>
        </div>
      </div>

      <div className="filter-row" id="fleet-filters">
        {filterPills.map(pill => (
          <span
            key={pill.key}
            className={`fpill${filter === pill.key ? ' active' : ''}`}
            data-filter={pill.key}
            onClick={() => setFilter(pill.key)}
          >
            {pill.label}
          </span>
        ))}
      </div>

      <div id="fleet-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
              <path d="M2 20h20" />
              <path d="M10 4v16" />
              <path d="M10 4l8 4" />
              <path d="M18 8v12" />
            </svg>
            <h4>No Assets</h4>
            <p>Add assets or adjust filters</p>
          </div>
        ) : (
          filtered.map(crane => {
            const profile = state.operatorProfiles[crane.operator || ''] || {};
            const profileName = (profile as { name?: string }).name;
            const opTimesheets: TimesheetEntry[] = (crane.operator ? state.timesheets[crane.operator] : undefined) || [];
            const alerts = getComplianceAlerts(crane.reg, state.compliance);
            return (
              <VehicleCard
                key={crane.reg}
                crane={crane}
                timesheets={opTimesheets}
                operatorName={profileName}
                alerts={alerts}
                onAssign={handleAssign}
                onDelete={handleDelete}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
