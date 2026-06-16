import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../matchpro.css'

export default function MpDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/matchpro/login')
  }

  return (
    <div>
      <div className="mp-topbar">
        <span className="mp-topbar-user">
          {user?.role === 'recruteur'
            ? (user?.company_name || 'Recruteur')
            : [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Candidat'}
        </span>

        <button className="mp-logout" onClick={handleLogout}>Se deconnecter</button>
      </div>

      <div className="mshell-placeholder" style={{ padding: '40px 0', textAlign: 'left' }}>
        <h2>
          {user?.role === 'recruteur' ? 'Espace recruteur' : 'Espace candidat'}
        </h2>

        {user?.role === 'candidat' && (
          <div style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-soft)' }}>
            <p><strong style={{ color: 'var(--ink)' }}>{[user.first_name, user.last_name].filter(Boolean).join(' ')}</strong></p>
            <p>{user.city}, {user.country}</p>
            {user.domaine && <p>Domaine : {user.domaine}</p>}
            {user.diplome && <p>Diplome : {user.diplome}</p>}
            {user.competences?.length > 0 && <p>Competences : {user.competences.join(', ')}</p>}
          </div>
        )}

        {user?.role === 'recruteur' && (
          <div style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-soft)' }}>
            <p><strong style={{ color: 'var(--ink)' }}>{user.company_name}</strong></p>
            <p>{user.city}, {user.country}</p>
            {user.sector && <p>Secteur : {user.sector}</p>}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
          {user?.role === 'recruteur' ? (
            <button
              className="mp-submit"
              onClick={() => navigate('/matchpro/recruiter/jobs')}
              style={{ width: 'auto' }}
            >
              Offres & candidatures
            </button>
          ) : (
            <>
              <button
                className="mp-submit"
                onClick={() => navigate('/matchpro/jobs')}
                style={{ width: 'auto' }}
              >
                Parcourir les offres
              </button>
              <button
                className="mp-submit"
                onClick={() => navigate('/matchpro/my-applications')}
                style={{ width: 'auto', background: 'var(--line-strong)' }}
              >
                Mes candidatures
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
