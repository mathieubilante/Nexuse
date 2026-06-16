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

  const displayName = user?.role === 'recruteur'
    ? (user.company_name || user.email)
    : [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email

  return (
    <div>
      <div className="mp-topbar">
        <span className="mp-topbar-user">{displayName}</span>
        <button className="mp-logout" onClick={handleLogout}>Se deconnecter</button>
      </div>

      <div className="mshell-placeholder" style={{ padding: '40px 0', textAlign: 'left' }}>
        <h2>
          {user?.role === 'recruteur' ? 'Espace recruteur' : 'Espace candidat'}
        </h2>
        {user?.role === 'candidat' && (
          <div style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-soft)' }}>
            <p><strong style={{ color: 'var(--ink)' }}>{user.first_name} {user.last_name}</strong></p>
            <p>{user.city}, {user.country}</p>
            {user.birth_date && <p>Ne(e) le {user.birth_date} {user.birth_place ? `a ${user.birth_place}` : ''}</p>}
            {user.domaine && <p>Secteur : {user.domaine}</p>}
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
        <p style={{ marginTop: 20 }}>
          {user?.role === 'recruteur'
            ? "Bientot ici : publier des offres, voir les candidatures recues."
            : "Bientot ici : parcourir les offres, postuler, discuter avec l'assistant CV."}
        </p>
      </div>
    </div>
  )
}