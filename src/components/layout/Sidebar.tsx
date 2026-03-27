import type { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarUser } from './SidebarUser';

// ── Icon components ──────────────────────────────────────────────────────────

function FleetIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M2 20h20" />
      <path d="M10 4v16" />
      <path d="M10 4l8 4" />
      <path d="M18 8v12" />
    </svg>
  );
}

function AnalyticsIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function BillingIcon(): ReactNode {
  return (
    <svg className="rupee-icon" viewBox="0 0 24 24" stroke="none">
      <text x="12" y="15.5" textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="600" fontFamily="system-ui,-apple-system,sans-serif">₹</text>
    </svg>
  );
}

function GpsIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FuelIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M3 22V8l7-6 7 6v14" />
      <rect x="9" y="12" width="4" height="10" />
      <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
      <path d="M19 8V5" />
    </svg>
  );
}

function CamerasIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function DiagnosticsIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function AssetsIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function OperatorsIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="23" y1="21" x2="23" y2="15" />
      <line x1="20" y1="18" x2="26" y2="18" />
    </svg>
  );
}

function EarningsIcon(): ReactNode {
  return (
    <svg className="rupee-icon" viewBox="0 0 24 24" stroke="none">
      <text x="12" y="15.5" textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="600" fontFamily="system-ui,-apple-system,sans-serif">₹</text>
    </svg>
  );
}

function AttendanceIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}

function LoggerIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function OpHistoryIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function OpFilesIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  onSignOut: () => void;
}

export function Sidebar({ onSignOut }: SidebarProps) {
  const { sidebarCollapsed, toggleTheme } = useApp();

  return (
    <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`} id="sidebar">
      <SidebarHeader />

      <div className="sidebar-nav">
        {/* ── Command section ── */}
        <div className="nav-section-label">Command</div>
        <div className="nav-section-divider" />

        <SidebarNavItem page="fleet"       label="Fleet"        icon={<FleetIcon />}       countId="nc-fleet" />
        <SidebarNavItem page="analytics"   label="Analytics"    icon={<AnalyticsIcon />} />
        <SidebarNavItem page="billing"     label="Billing"      icon={<BillingIcon />} />
        <SidebarNavItem page="gps"         label="Live GPS"     icon={<GpsIcon />} />
        <SidebarNavItem page="fuel"        label="Fuel"         icon={<FuelIcon />} />
        <SidebarNavItem page="cameras"     label="Cameras"      icon={<CamerasIcon />} />
        <SidebarNavItem page="diagnostics" label="Diagnostics"  icon={<DiagnosticsIcon />} countId="nc-diag" />

        {/* ── Manage section ── */}
        <div className="nav-section-label">Manage</div>
        <div className="nav-section-divider" />

        <SidebarNavItem page="assets"    label="Assets"     icon={<AssetsIcon />}    countId="nc-assets" />
        <SidebarNavItem page="operators" label="Operators"  icon={<OperatorsIcon />} countId="nc-ops" />
        <SidebarNavItem page="earnings"  label="Earnings"   icon={<EarningsIcon />} />
        <SidebarNavItem page="attendance" label="Attendance" icon={<AttendanceIcon />} />

        {/* ── System section ── */}
        <div className="nav-section-label">System</div>
        <div className="nav-section-divider" />

        {/* Dark mode toggle */}
        <div className="nav-item nav-theme-row" onClick={toggleTheme}>
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span className="nav-label">Dark Mode</span>
          <ThemeToggle id="sidebar-theme-switch" />
          {sidebarCollapsed && <span className="nav-tooltip">Theme</span>}
        </div>

        {/* ── Operator View section ── */}
        <div className="nav-section-label">Operator View</div>
        <div className="nav-section-divider" />

        <SidebarNavItem page="logger"     label="Log Time" icon={<LoggerIcon />} />
        <SidebarNavItem page="op-history" label="History"  icon={<OpHistoryIcon />} countId="nc-op-ts" />
        <SidebarNavItem page="op-files"   label="My Files" icon={<OpFilesIcon />}   countId="nc-op-files" />
      </div>

      <SidebarUser onSignOut={onSignOut} />
    </aside>
  );
}
