const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5080/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('grievance_admin_token')

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 204) return null

  let body = null
  try {
    body = await res.json()
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = body?.message || body?.title || `Request failed (${res.status})`
    throw new Error(message)
  }

  return body
}

export const api = {
  createGrievance: (payload) =>
    request('/grievances', { method: 'POST', body: JSON.stringify(payload) }),

  trackGrievance: (ticketId) =>
    request(`/grievances/track/${encodeURIComponent(ticketId)}`),

  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  listGrievances: (status) =>
    request(`/grievances${status ? `?status=${status}` : ''}`),

  updateStatus: (id, status, resolutionNotes) =>
    request(`/grievances/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionNotes }),
    }),
}

export const CATEGORY_OPTIONS = [
  { value: 0, label: 'Academic' },
  { value: 1, label: 'Hostel' },
  { value: 2, label: 'Infrastructure' },
  { value: 3, label: 'Faculty' },
  { value: 4, label: 'Administration' },
  { value: 5, label: 'Other' },
]

export const STATUS_OPTIONS = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'InProgress', display: 'In Progress' },
  { value: 2, label: 'Resolved' },
  { value: 3, label: 'Rejected' },
]
