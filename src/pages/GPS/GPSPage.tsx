import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';

export function GPSPage({ active }: { active: boolean }) {
  const { showToast } = useApp();
  const { blackbuck, blackbuckLoading, refetchBlackbuck } = useData();

  function handleSync() {
    refetchBlackbuck();
    showToast('Syncing telemetry…', 'info');
  }

  function handleMock() {
    showToast('Mock data injected', 'info');
  }

  const vehicles = blackbuck?.vehicles || [];

  return (
    <div className={`page ${active ? 'active' : ''}`} id="page-gps">
      <div className="gps-sync-bar">
        <div>
          <div style={{ fontFamily: 'var(--fh)', fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>
            Live GPS Tracking
          </div>
          <div style={{ fontSize: '10px', fontFamily: 'var(--fm)', color: 'var(--t3)', marginTop: '2px' }}>
            fleet.blackbuck.com
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-sm accent" id="btn-gps-sync" onClick={handleSync}>
            <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {blackbuckLoading ? 'Syncing…' : 'Sync Telemetry'}
          </button>
          <button className="btn-sm outline" id="btn-gps-mock" title="Inject test data without Blackbuck credentials" onClick={handleMock}>
            <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Test Mock
          </button>
        </div>
      </div>

      {vehicles.length > 0 ? (
        <div style={{ marginBottom: '16px', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Status</th>
                <th>Speed</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.registration_number}>
                  <td style={{ fontWeight: 700 }}>{v.registration_number}</td>
                  <td>
                    <span className={`badge ${v.status === 'moving' ? 'green' : v.status === 'stopped' ? 'red' : ''}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>{v.speed != null ? `${v.speed} km/h` : '—'}</td>
                  <td style={{ fontSize: '10px', color: 'var(--t3)' }}>{v.last_updated || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="gps-iframe-wrap">
        <iframe src="https://fleet.blackbuck.com" title="GPS Tracking" allow="geolocation" />
      </div>
    </div>
  );
}
