import { useApp } from '../../context/AppContext';

interface SidebarUserProps {
  onSignOut: () => void;
}

export function SidebarUser({ onSignOut }: SidebarUserProps) {
  const { user, sidebarCollapsed } = useApp();
  const initials = user ? user.slice(0, 2).toUpperCase() : '—';

  return (
    <div className="sidebar-user">
      <div className="user-row sidebar-user-clickable" id="sidebar-user-row" title="Account settings">
        <div className="user-av" id="user-av">{initials}</div>
        {!sidebarCollapsed && (
          <div className="user-info">
            <div className="user-name" id="user-name-display">{user || '—'}</div>
          </div>
        )}
      </div>
      {!sidebarCollapsed && (
        <button className="btn-signout" onClick={onSignOut}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="btn-signout-label">Sign Out</span>
        </button>
      )}
    </div>
  );
}
