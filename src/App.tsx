import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { ToastContainer } from './components/ui/Toast';
import { FleetPage } from './pages/Fleet/FleetPage';
import { AssetsPage } from './pages/Assets/AssetsPage';
import { OperatorsPage } from './pages/Operators/OperatorsPage';
import { EarningsPage } from './pages/Earnings/EarningsPage';
import { AttendancePage } from './pages/Attendance/AttendancePage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { BillingPage } from './pages/Billing/BillingPage';
import { GPSPage } from './pages/GPS/GPSPage';
import { FuelPage } from './pages/Fuel/FuelPage';
import { CamerasPage } from './pages/Cameras/CamerasPage';
import { DiagnosticsPage } from './pages/Diagnostics/DiagnosticsPage';
import { LoggerPage } from './pages/Logger/LoggerPage';
import { OpHistoryPage } from './pages/OpHistory/OpHistoryPage';
import { OpFilesPage } from './pages/OpFiles/OpFilesPage';
import { ErrorBoundary } from './ErrorBoundary';
import { api, setToken, clearToken, getToken } from './services/api';

export default function App() {
  const { activePage, sidebarCollapsed, user, setUser } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Login / register form state
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // On mount: if a token exists, restore the session via /auth/me
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.me()
      .then(me => setUser(me.phone))
      .catch(() => {
        clearToken();
        setUser(null);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSignOut() {
    clearToken();
    setUser(null);
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login(phone, password);
        setToken(res.token);
        setUser(res.phone);
      } else {
        const res = await api.register(phone, password, companyName);
        setToken(res.token);
        setUser(res.phone);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAuthLoading(false);
    }
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <form onSubmit={handleSubmit} style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '40px',
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--fh)' }}>
            Suprwise
          </div>
          <div style={{ fontSize: '13px', color: 'var(--t3)' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setAuthError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                background: mode === 'login' ? 'var(--accent)' : 'var(--bg3)',
                color: mode === 'login' ? '#fff' : 'var(--t2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setAuthError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                background: mode === 'register' ? 'var(--accent)' : 'var(--bg3)',
                color: mode === 'register' ? '#fff' : 'var(--t2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Register
            </button>
          </div>

          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Phone number"
            required
            style={{
              padding: '10px 14px',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--t1)',
              fontSize: '14px',
              outline: 'none',
            }}
            autoFocus
          />

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{
              padding: '10px 14px',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--t1)',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          {mode === 'register' && (
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Company name"
              required
              style={{
                padding: '10px 14px',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--t1)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          )}

          {authError && (
            <div style={{ fontSize: '13px', color: 'var(--error, #e53e3e)', padding: '8px 12px', background: 'var(--bg3)', borderRadius: '6px' }}>
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            style={{
              padding: '10px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: authLoading ? 'not-allowed' : 'pointer',
              opacity: authLoading ? 0.7 : 1,
            }}
          >
            {authLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div id="app-shell" className={`visible${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="body-split">
      <Sidebar onSignOut={handleSignOut} />
      <div className="page-content">
        <ErrorBoundary><FleetPage active={activePage === 'fleet'} /></ErrorBoundary>
        <ErrorBoundary><AssetsPage active={activePage === 'assets'} /></ErrorBoundary>
        <ErrorBoundary><OperatorsPage active={activePage === 'operators'} /></ErrorBoundary>
        <ErrorBoundary><EarningsPage active={activePage === 'earnings'} /></ErrorBoundary>
        <ErrorBoundary><AttendancePage active={activePage === 'attendance'} /></ErrorBoundary>
        <ErrorBoundary><AnalyticsPage active={activePage === 'analytics'} /></ErrorBoundary>
        <ErrorBoundary><BillingPage active={activePage === 'billing'} /></ErrorBoundary>
        <ErrorBoundary><GPSPage active={activePage === 'gps'} /></ErrorBoundary>
        <ErrorBoundary><FuelPage active={activePage === 'fuel'} /></ErrorBoundary>
        <ErrorBoundary><CamerasPage active={activePage === 'cameras'} /></ErrorBoundary>
        <ErrorBoundary><DiagnosticsPage active={activePage === 'diagnostics'} /></ErrorBoundary>
        <ErrorBoundary><LoggerPage active={activePage === 'logger'} /></ErrorBoundary>
        <ErrorBoundary><OpHistoryPage active={activePage === 'op-history'} /></ErrorBoundary>
        <ErrorBoundary><OpFilesPage active={activePage === 'op-files'} /></ErrorBoundary>
      </div>
      </div>
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSignOut={handleSignOut}
      />
      <ToastContainer />
    </div>
  );
}
