import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { SECTEURS_ENTREPRISE } from '../data/formData.js'
import '../matchpro.css'

export default function RecruiterProfile() {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    company_name: '',
    sector: '',
    country: '',
    city: '',
    phone: '',
  })

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.company_name.trim() || !form.country.trim() || !form.city.trim()) {
      setError("Nom de l'entreprise, pays et ville sont requis.")
      return
    }
    setLoading(true)
    try {
      await updateProfile(form)
      navigate('/matchpro/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mp-auth" style={{ maxWidth: 460 }}>
      <h2>Completez votre profil recruteur</h2>
      <p className="mp-auth-sub">Ces informations seront visibles par les candidats.</p>

      {error && <div className="mp-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mp-field">
          <label htmlFor="full_name">Votre nom</label>
          <input id="full_name" type="text" value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} />
        </div>
        <div className="mp-field">
          <label htmlFor="company_name">Nom de l'entreprise</label>
          <input id="company_name" type="text" value={form.company_name} onChange={(e) => setField('company_name', e.target.value)} required />
        </div>
        <div className="mp-field">
          <label htmlFor="sector">Secteur d'activite</label>
          <select id="sector" value={form.sector} onChange={(e) => setField('sector', e.target.value)}>
            <option value="">Selectionner...</option>
            {SECTEURS_ENTREPRISE.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="mp-field">
          <label htmlFor="country">Pays</label>
          <input id="country" type="text" value={form.country} onChange={(e) => setField('country', e.target.value)} required />
        </div>
        <div className="mp-field">
          <label htmlFor="city">Ville / Region</label>
          <input id="city" type="text" value={form.city} onChange={(e) => setField('city', e.target.value)} required />
        </div>
        <div className="mp-field">
          <label htmlFor="phone">Telephone</label>
          <input id="phone" type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
        </div>

        <button className="mp-submit" type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Terminer'}
        </button>
      </form>
    </div>
  )
}
