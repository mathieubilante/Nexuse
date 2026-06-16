import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getJobs, applyToJob, passJob, pauseJob } from '../api.js'
import '../matchpro.css'

export default function CandidateJobs() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [jobs, setJobs] = useState([])
  const [confirmingId, setConfirmingId] = useState(null)

  const filters = useMemo(() => {
    return {
      city: user?.city,
      country: user?.country,
      domaine: user?.domaine,
    }
  }, [user])

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getJobs(token, filters)
      setJobs(data.jobs || [])
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

  const doApply = async (jobId) => {
    await applyToJob(token, jobId)
    setConfirmingId(null)
    await refresh()
  }

  const doPass = async (jobId) => {
    await passJob(token, jobId)
    await refresh()
  }

  const doPause = async (jobId) => {
    await pauseJob(token, jobId)
    await refresh()
  }

  return (
    <div>
      <div className="mshell-placeholder" style={{ padding: '0 0 24px 0', textAlign: 'left' }}>
        <h2 style={{ marginTop: 0 }}>Offres disponibles</h2>
        {error && <div className="mp-error">{error}</div>}
      </div>

      {loading ? <div className="mshell-placeholder">Chargement...</div> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {jobs.map((job) => {
          const company = job.entreprise || job.company_name
          const location = [job.city, job.country].filter(Boolean).join(', ')

          return (
            <div key={job.id} className="mp-role-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>
                    {job.poste}
                  </div>
                  <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{company}</span>
                    {location ? <span> · {location}</span> : null}
                  </div>
                  {job.domaine ? (
                    <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 6 }}>Domaine : {job.domaine}</div>
                  ) : null}
                </div>

                <div style={{ minWidth: 230, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    className="mp-submit"
                    style={{ background: 'var(--match-accent)' }}
                    disabled={confirmingId !== null && confirmingId !== job.id}
                    onClick={() => setConfirmingId(job.id)}
                  >
                    Postuler
                  </button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="mp-logout" style={{ flex: 1 }} onClick={() => doPass(job.id)}>
                      Pass
                    </button>
                    <button className="mp-logout" style={{ flex: 1 }} onClick={() => doPause(job.id)}>
                      Attendre
                    </button>
                  </div>
                </div>
              </div>

              {confirmingId === job.id ? (
                <div style={{ marginTop: 14, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 10 }}>
                    Confirmer candidature pour <strong style={{ color: 'var(--ink)' }}>{job.poste}</strong> chez{' '}
                    <strong style={{ color: 'var(--ink)' }}>{company}</strong> ?
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="mp-submit" onClick={() => doApply(job.id)}>
                      Confirmer
                    </button>
                    <button className="mp-logout" onClick={() => setConfirmingId(null)}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}

        {jobs.length === 0 && !loading ? (
          <div className="mshell-placeholder">Aucune offre correspondante pour le moment.</div>
        ) : null}
      </div>
    </div>
  )
}

