import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { SECTEURS_ENTREPRISE } from '../data/formData.js'
import { PAYS_AFRIQUE_OUEST } from '../data/countries.js'
import '../matchpro.css'

export default function RecruiterProfile() {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    company_name: '',
    sector: '',
    country: '',
    city: '',
    phone: '',
  })

  const selectedCountry = PAYS_AFRIQUE_OUEST.find((p) => p.name === form.country)

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const handleCountryChange = (countryName) => {
    const country = PAYS_AFRIQUE_OUEST.find((p) => p.name === countryName)
    setForm((f) => {
      let phone = f.phone
      const previousCountry = PAYS_AFRIQUE_OUEST.find((p) => p.name === f.country)
      if (!phone || (previousCountry && phone === previousCountry.dial + ' ')) {
        phone = country ? country.dial + ' ' : ''
      }
      return { ...f, country: countryName, phone }
    })
  }

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
          <label htmlFor="first_name">Votre nom</label>
          <input id="first_name" type="text" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} />
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
          <select id="country" value={form.country} onChange={(e) => handleCountryChange(e.target.value)} required>
            <option value="">Selectionner...</option>
            {PAYS_AFRIQUE_OUEST.map((p) => (
              <option key={p.code} value={p.name}>{p.name} ({p.dial})</option>
            ))}
          </select>
        </div>
        <div className="mp-field">
          <label htmlFor="city">Ville / Region</label>
          <input id="city" type="text" value={form.city} onChange={(e) => setField('city', e.target.value)} required />
        </div>
        <div className="mp-field">
          <label htmlFor="phone">Telephone {selectedCountry ? `(${selectedCountry.dial})` : ''}</label>
          <input id="phone" type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder={selectedCountry ? `${selectedCountry.dial} XX XX XX XX` : ''} />
        </div>

        <button className="mp-submit" type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Terminer'}
        </button>
      </form>
    </div>
  )
}