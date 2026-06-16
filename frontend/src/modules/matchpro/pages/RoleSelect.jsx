import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../matchpro.css'

export default function RoleSelect() {
  const [error, setError] = useState('')
  const { setRole } = useAuth()
  const navigate = useNavigate()

  const choose = async (role) => {
    setError('')
    try {
      await setRole(role)
      navigate('/matchpro/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mp-auth">
      <h2>Vous etes ici pour...</h2>
      <p className="mp-auth-sub">Ce choix determine votre espace MatchPro.</p>

      {error && <div className="mp-error">{error}</div>}

      <div className="mp-roles">
        <button className="mp-role-card" onClick={() => choose('candidat')}>
          <span className="mp-role-glyph">C</span>
          <span className="mp-role-text">
            <strong>Trouver un emploi</strong>
            <span>Parcourir les offres, postuler, etre accompagne par l'assistant.</span>
          </span>
        </button>
        <button className="mp-role-card" onClick={() => choose('recruteur')}>
          <span className="mp-role-glyph">R</span>
          <span className="mp-role-text">
            <strong>Recruter</strong>
            <span>Publier des offres et echanger avec les candidats.</span>
          </span>
        </button>
      </div>
    </div>
  )
}
