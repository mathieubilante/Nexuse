import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../modules/matchpro/context/AuthContext.jsx'
import './ModuleShell.css'

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
        fill="currentColor"
        opacity="0.95"
      />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.06 7.06 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.5 1h-3a.5.5 0 0 0-.49.42l-.36 2.54c-.58.22-1.12.52-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.11 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.5.41 1.05.72 1.63.94l.36 2.54c.04.24.25.42.49.42h3c.24 0 .45-.18.49-.42l.36-2.54c.58-.22 1.12-.52 1.63-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
        fill="currentColor"
        opacity="0.95"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 17v-1h4v-4h-4v-1l4-4 1 1-2 2h5v10h-5l2 2-1 1-4-4Zm-6 4V3h10v2H6v14h8v2H4Z"
        fill="currentColor"
        opacity="0.95"
      />
    </svg>
  )
}

export default function ModuleShell({ module, children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/matchpro/login')
  }

  return (
    <div className="mshell" style={{ '--row-accent': module.accent, '--row-tint': module.tint, '--row-deep': module.deep }}>
      <header className="mshell-header">
        <div className="mshell-toolbar">
          <Link to="/" className="mshell-back">&larr; Nexus</Link>

          <div className="mshell-toolbar-actions">
            <button type="button" className="mshell-icon-btn" aria-label="Notifications" title="Notifications">
              <BellIcon />
            </button>
            <button type="button" className="mshell-icon-btn" aria-label="Paramètres" title="Paramètres">
              <GearIcon />
            </button>
            <button type="button" className="mshell-icon-btn" aria-label="Déconnexion" title="Déconnexion" onClick={handleLogout}>
              <LogoutIcon />
            </button>
          </div>
        </div>

        <div className="mshell-title">
          <span className="mshell-glyph">{module.glyph}</span>
          <div>
            <h1>{module.name}</h1>
            <p>{module.tagline}</p>
          </div>
        </div>
      </header>
      <main className="mshell-body">
        {children}
      </main>
    </div>
  )
}

