export const API_BASE = "http://localhost:5000"

export async function apiFetch(path, { token, ...options } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || "Une erreur est survenue.")
  }

  return data
}

// Jobs / candidatures
export async function getJobs(token, { city, region, country, domaine } = {}) {
  const params = new URLSearchParams()
  if (city) params.set('city', city)
  if (region) params.set('region', region)
  if (country) params.set('country', country)
  if (domaine) params.set('domaine', domaine)

  const qs = params.toString()
  return apiFetch(`/api/jobs${qs ? `?${qs}` : ''}`, { token })
}

export async function createJob(token, payload) {
  return apiFetch('/api/jobs', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export async function applyToJob(token, jobId) {
  return apiFetch(`/api/jobs/${jobId}/apply`, {
    method: 'POST',
    token,
    body: JSON.stringify({}),
  })
}

export async function passJob(token, jobId) {
  return apiFetch(`/api/jobs/${jobId}/pass`, {
    method: 'POST',
    token,
    body: JSON.stringify({}),
  })
}

export async function pauseJob(token, jobId) {
  return apiFetch(`/api/jobs/${jobId}/pause`, {
    method: 'POST',
    token,
    body: JSON.stringify({}),
  })
}

export async function getApplicationsForJob(token, jobId) {
  return apiFetch(`/api/jobs/${jobId}/applications`, { token })
}

export async function respondToApplication(token, jobId, appId, { action, message } = {}) {
  return apiFetch(`/api/jobs/${jobId}/applications/${appId}/respond`, {
    method: 'POST',
    token,
    body: JSON.stringify({ action, message }),
  })
}

export async function getMyApplications(token) {
  return apiFetch('/api/users/me/applications', { token })
}


