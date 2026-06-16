import { Link } from 'react-router-dom'
import { MODULES } from '../data/modules.js'
import './Dashboard.css'

function formatFRDate(d) {
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function IconBell() {
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

function IconGear() {
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

function IconLogout() {
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

export default function Dashboard() {
  const dateLabel = formatFRDate(new Date())

  return (
    <div className="dash">
      <div className="dash-bg" />

      <header className="dash-topbar">
        <div className="dash-topbar-left">
          <button className="dash-icon-btn" type="button" aria-label="Notifications">
            <IconBell />
          </button>
          <button className="dash-icon-btn" type="button" aria-label="Paramètres">
            <IconGear />
          </button>
          <button className="dash-icon-btn" type="button" aria-label="Déconnexion">
            <IconLogout />
          </button>
        </div>
        <div className="dash-date">{dateLabel}</div>
      </header>

      <div className="dash-hero">
        <h1 className="dash-title">Une infrastructure unique, trois écosystèmes dédiés.</h1>
        <p className="dash-subtitle">
          Sélectionnez votre espace de travail pour vous connecter. Pour des raisons de sécurité et de confidentialité,
          chaque module dispose d'un environnement d'authentification indépendant.
        </p>
      </div>

      <section className="dash-cards">
        {MODULES.map((m, idx) => (
          <Link
            key={m.id}
            to={m.path}
            className="dash-card"
            style={{
              '--accent': m.accent,
              '--tint': m.tint,
              '--deep': m.deep,
            }}
          >
            <div className="dash-card-inner">
              <div className="dash-card-top">
                <div className="dash-card-code">0{idx + 1}</div>
                <div className="dash-card-glyph">{m.glyph}</div>
              </div>

              <div>
                <div className="dash-card-name">{m.name}</div>
                <div className="dash-card-tagline" style={{ color: m.accent }}>
                  {m.tagline}
                </div>
              </div>

              <div style={{ color: 'rgba(156,163,175,0.95)', fontSize: 14, lineHeight: 1.6 }}>
                {m.description}
              </div>

              <div className="dash-card-badge">
                <div className="dash-card-stat">{m.stat.value}</div>
                <div className="dash-card-stat-label">{m.stat.label}</div>
              </div>

              <div className="dash-card-link">
                <span style={{ color: m.accent }}>Ouvrir</span>
                <span aria-hidden="true">→</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}

