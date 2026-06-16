import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { DOMAINES, DIPLOMES, COMPETENCES_PAR_DOMAINE } from '../data/formData.js'
import '../matchpro.css'

const STEPS = ['identite', 'profil', 'competences']

export default function CandidateProfile() {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    country: '',
    city: '',
    phone: '',
    domaine: '',
    diplome: '',
    competences: [],
  })

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }))

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
    if (step === 0 && (!form.full_name.trim() || !form.country.trim() || !form.city.trim())) {
      setError('Nom complet, pays et ville sont requis.')
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      // Backend expects first_name/last_name (not full_name)
      const parts = (form.full_name || '').trim().split(/\s+/)
      const first_name = parts.slice(0, -1).join(' ') || (parts[0] || '')
      const last_name = parts.slice(-1)[0] || ''

      const payload = {
        first_name,
        last_name,
        country: form.country,
        city: form.city,
        phone: form.phone,
        domaine: form.domaine,
        diplome: form.diplome,
        competences: form.competences,
      }

      await updateProfile(payload)
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
        {step === 1 && 'Profil professionnel'}
        {step === 2 && 'Competences'}
      </p>

      {error && <div className="mp-error">{error}</div>}

      {step === 0 && (
        <>
          <div className="mp-field">
            <label htmlFor="full_name">Nom complet</label>
            <input id="full_name" type="text" value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} required />
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
        </>
      )}

      {step === 1 && (
        <>
          <div className="mp-field">
            <label htmlFor="domaine">Domaine d'activite</label>
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
            <p className="mp-auth-sub">Choisissez un domaine a l'etape precedente pour voir les competences.</p>
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
