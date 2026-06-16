import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { DOMAINES, DIPLOMES, COMPETENCES_PAR_DOMAINE } from '../data/formData.js'
import { PAYS_AFRIQUE_OUEST } from '../data/countries.js'
import '../matchpro.css'

const STEPS = ['identite', 'activite', 'competences']

export default function CandidateProfile() {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    birth_place: '',
    country: '',
    city: '',
    phone: '',
    domaine: '',
    diplome: '',
    competences: [],
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

  const toggleCompetence = (comp) => {
    setForm((f) => ({
      ...f,
      competences: f.competences.includes(comp)
        ? f.competences.filter((c) => c !== comp)
        : [...f.competences, comp],
    }))
  }

  const next = () => {
    setError('')
    if (step === 0) {
      if (!form.first_name.trim() || !form.last_name.trim() || !form.country.trim() || !form.city.trim()) {
        setError('Prenom, nom, pays et ville sont requis.')
        return
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setError('')
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

  const availableCompetences = form.domaine ? (COMPETENCES_PAR_DOMAINE[form.domaine] || []) : []

  return (
    <div className="mp-auth" style={{ maxWidth: 460 }}>
      <h2>Completez votre profil</h2>
      <p className="mp-auth-sub">
        Etape {step + 1} sur {STEPS.length} —{' '}
        {step === 0 && 'Identite'}
        {step === 1 && "Secteur d'activite"}
        {step === 2 && 'Competences'}
      </p>

      {error && <div className="mp-error">{error}</div>}

      {step === 0 && (
        <>
          <div className="mp-field">
            <label htmlFor="first_name">Prenom</label>
            <input id="first_name" type="text" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} required />
          </div>
          <div className="mp-field">
            <label htmlFor="last_name">Nom</label>
            <input id="last_name" type="text" value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} required />
          </div>
          <div className="mp-field">
            <label htmlFor="birth_date">Date de naissance</label>
            <input id="birth_date" type="date" value={form.birth_date} onChange={(e) => setField('birth_date', e.target.value)} />
          </div>
          <div className="mp-field">
            <label htmlFor="birth_place">Lieu de naissance</label>
            <input id="birth_place" type="text" value={form.birth_place} onChange={(e) => setField('birth_place', e.target.value)} placeholder="Ville, pays" />
          </div>
          <div className="mp-field">
            <label htmlFor="country">Pays de residence</label>
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
        </>
      )}

      {step === 1 && (
        <>
          <div className="mp-field">
            <label htmlFor="domaine">Secteur d'activite</label>
            <select id="domaine" value={form.domaine} onChange={(e) => setField('domaine', e.target.value)}>
              <option value="">Selectionner...</option>
              {DOMAINES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="mp-field">
            <label htmlFor="diplome">Niveau de diplome</label>
            <select id="diplome" value={form.diplome} onChange={(e) => setField('diplome', e.target.value)}>
              <option value="">Selectionner...</option>
              {DIPLOMES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {!form.domaine && (
            <p className="mp-auth-sub">Choisissez un secteur a l'etape precedente pour voir les competences.</p>
          )}
          {availableCompetences.length > 0 && (
            <div className="mp-roles">
              {availableCompetences.map((comp) => (
                <label key={comp} className="mp-role-card" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.competences.includes(comp)}
                    onChange={() => toggleCompetence(comp)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span className="mp-role-text">
                    <strong>{comp}</strong>
                  </span>
                </label>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {step > 0 && (
          <button className="mp-submit" style={{ background: 'var(--ink-faint)' }} onClick={back}>
            Retour
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button className="mp-submit" onClick={next}>Suivant</button>
        ) : (
          <button className="mp-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enregistrement...' : 'Terminer'}
          </button>
        )}
      </div>
    </div>
  )
}