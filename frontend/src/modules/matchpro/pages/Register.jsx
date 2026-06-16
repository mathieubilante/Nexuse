import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../matchpro.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password)
      navigate('/matchpro/role')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mp-auth">
      <h2>Creer un compte</h2>
      <p className="mp-auth-sub">Rejoignez MatchPro avec votre email.</p>

      {error && <div className="mp-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mp-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="mp-field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <button className="mp-submit" type="submit" disabled={loading}>
          {loading ? 'Creation...' : 'Creer mon compte'}
        </button>
      </form>

      <div className="mp-switch">
        Deja un compte ?
        <button onClick={() => navigate('/matchpro/login')}>Se connecter</button>
      </div>
    </div>
  )
}
