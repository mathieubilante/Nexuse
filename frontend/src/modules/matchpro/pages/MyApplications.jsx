import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyApplications } from '../api.js'
import '../matchpro.css'

export default function MyApplications() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apps, setApps] = useState([])

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyApplications(token)
      setApps(data.applications || [])
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

  return (
    <div>
      <div className="mshell-placeholder" style={{ padding: '0 0 24px 0', textAlign: 'left' }}>
        <h2 style={{ marginTop: 0 }}>Mes candidatures</h2>
        {error && <div className="mp-error">{error}</div>}
      </div>

      {loading ? <div className="mshell-placeholder">Chargement...</div> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!loading && apps.length === 0 ? (
          <div className="mshell-placeholder">Aucune candidature pour le moment.</div>
        ) : null}

        {apps.map((app) => {
          const statusLabel =
            app.status === 'pending'
              ? 'En attente'
              : app.status === 'accepted'
                ? 'Acceptee'
                : app.status === 'rejected'
                  ? 'Refusee'
                  : app.status

          return (
            <div key={app.id} className="mp-role-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{app.poste}</div>
              <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>
                {app.entreprise} · {[app.city, app.country].filter(Boolean).join(', ')}
              </div>

              <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 8 }}>
                Statut : <strong style={{ color: 'var(--ink)' }}>{statusLabel}</strong>
              </div>

              {app.status === 'rejected' && app.message_from_recruiter ? (
                <div style={{ marginTop: 10, color: 'var(--ink-soft)', fontSize: 13 }}>
                  Message recruteur :
                  <div style={{ marginTop: 6, color: 'var(--ink)' }}>{app.message_from_recruiter}</div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

