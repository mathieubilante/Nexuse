 import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getJobs, getApplicationsForJob, createJob, respondToApplication } from '../api.js'
import '../matchpro.css'

export default function RecruiterJobs() {
  const { token, user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [applications, setApplications] = useState([])

  const [newJob, setNewJob] = useState({
    poste: '',
    entreprise: '',
    secteur: user?.sector || '',
    domaine: user?.domaine || '',
    competences_requises: '',
    country: user?.country || '',
    city: user?.city || '',
  })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      // Filtre simple: on prend la city/country par défaut côté serveur
      const data = await getJobs(token, { city: user?.city, country: user?.country })
      setJobs(data.jobs || [])
      if (!selectedJobId && data.jobs?.length) {
        setSelectedJobId(data.jobs[0].id)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !user) return
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role])

  useEffect(() => {
    if (!token || !selectedJobId) return
    ;(async () => {
      try {
        const data = await getApplicationsForJob(token, selectedJobId)
        setApplications(data.applications || [])
      } catch (e) {
        setError(e.message)
      }
    })()
  }, [token, selectedJobId])

  const submitJob = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        poste: newJob.poste,
        entreprise: newJob.entreprise || user?.company_name,
        secteur: newJob.secteur || user?.sector,
        domaine: newJob.domaine || user?.domaine,
        competences_requises: newJob.competences_requises
          ? newJob.competences_requises.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        country: newJob.country || user?.country,
        city: newJob.city || user?.city,
        // region non gérée dans le schéma users actuel
      }
      const data = await createJob(token, payload)
      const createdJobId = data?.job?.id
      setNewJob((f) => ({ ...f, poste: '', competences_requises: '' }))

      // Forcer la sélection avant refresh pour garantir que l’offre nouvellement créée reste sélectionnée
      if (createdJobId) setSelectedJobId(createdJobId)

      // Rafraîchir directement
      await refresh()

    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <div className="mshell-placeholder" style={{ padding: '0 0 24px 0', textAlign: 'left' }}>
        <h2 style={{ marginTop: 0 }}>Offres recruteur</h2>
        {error && <div className="mp-error">{error}</div>}
      </div>

      <form onSubmit={submitJob} style={{ marginBottom: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="mp-field" style={{ marginBottom: 0 }}>
            <label>Poste</label>
            <input value={newJob.poste} onChange={(e) => setNewJob((f) => ({ ...f, poste: e.target.value }))} required />
          </div>
          <div className="mp-field" style={{ marginBottom: 0 }}>
            <label>Entreprise</label>
            <input
              value={newJob.entreprise}
              onChange={(e) => setNewJob((f) => ({ ...f, entreprise: e.target.value }))}
              placeholder={user?.company_name || ''}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div className="mp-field" style={{ marginBottom: 0 }}>
            <label>Secteur</label>
            <input value={newJob.secteur} onChange={(e) => setNewJob((f) => ({ ...f, secteur: e.target.value }))} />
          </div>
          <div className="mp-field" style={{ marginBottom: 0 }}>
            <label>Domaine</label>
            <input value={newJob.domaine} onChange={(e) => setNewJob((f) => ({ ...f, domaine: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div className="mp-field" style={{ marginBottom: 0 }}>
            <label>Pays</label>
            <input value={newJob.country} onChange={(e) => setNewJob((f) => ({ ...f, country: e.target.value }))} />
          </div>
          <div className="mp-field" style={{ marginBottom: 0 }}>
            <label>Ville / Region</label>
            <input value={newJob.city} onChange={(e) => setNewJob((f) => ({ ...f, city: e.target.value }))} />
          </div>
        </div>
        <div className="mp-field" style={{ marginTop: 12, marginBottom: 0 }}>
          <label>Competences requises (CSV)</label>
          <input
            value={newJob.competences_requises}
            onChange={(e) => setNewJob((f) => ({ ...f, competences_requises: e.target.value }))}
            placeholder="Ex: Excel, Gestion de projet"
          />
        </div>
        <button className="mp-submit" type="submit" disabled={loading}>
          {loading ? '...' : 'Publier offre'}
        </button>
      </form>

      {loading ? <div className="mshell-placeholder">Chargement...</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map((job) => (
            <button
              key={job.id}
              className="mp-role-card"
              style={{ cursor: 'pointer', textAlign: 'left', borderColor: selectedJobId === job.id ? 'var(--match-accent)' : 'var(--line-strong)' }}
              onClick={() => setSelectedJobId(job.id)}
            >
              <div className="mp-role-text">
                <strong style={{ color: 'var(--ink)' }}>{job.poste}</strong>
                <span>{job.entreprise} · {job.city}</span>
              </div>
            </button>
          ))}
          {jobs.length === 0 ? <div className="mshell-placeholder">Aucune offre pour le moment.</div> : null}
        </div>

        <div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Candidatures</div>
            {selectedJobId === null ? (
              <div className="mshell-placeholder" style={{ padding: 20 }}>Sélectionnez une offre.</div>
            ) : applications.length === 0 ? (
              <div className="mshell-placeholder" style={{ padding: 20 }}>Aucune candidature.</div>
            ) : (
              applications.map((app) => (
                <div key={app.id} style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 12 }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                    {app.first_name} {app.last_name}
                  </div>
                  <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>
                    {app.city ? `${app.city}` : ''}{app.country ? `, ${app.country}` : ''}
                  </div>
                  <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 6 }}>
                    Statut : <strong style={{ color: 'var(--ink)' }}>{app.status}</strong>
                  </div>

                  {app.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button
                        type="button"
                        className="mp-submit"
                        onClick={async () => {
                          try {
                            await respondToApplication(token, app.job_id, app.id, { action: 'accept' })
                            setApplications((prev) => prev.map((x) => (x.id === app.id ? { ...x, status: 'accepted' } : x)))
                          } catch (e) {
                            setError(e.message)
                          }
                        }}
                        style={{ flex: 1 }}
                      >
                        Accepter
                      </button>

                      <button
                        type="button"
                        className="mp-submit"
                        onClick={() => {
                          const msg = prompt('Message (optionnel) pour le refus :') || ''
                          ;(async () => {
                            try {
                              await respondToApplication(token, app.job_id, app.id, { action: 'reject', message: msg })
                              setApplications((prev) =>
                                prev.map((x) =>
                                  x.id === app.id ? { ...x, status: 'rejected', message_from_recruiter: msg || null } : x,
                                ),
                              )
                            } catch (e) {
                              setError(e.message)
                            }
                          })()
                        }}
                        style={{ flex: 1, background: 'var(--line-strong)' }}
                      >
                        Refuser
                      </button>
                    </div>
                  ) : null}

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

