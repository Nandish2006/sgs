import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { StatusBadge } from '../components/StatusStamp'

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Rejected', value: 'Rejected' },
]

export default function AdminDashboardPage() {
  const [cases, setCases] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('grievance_admin_token')
    if (!token) {
      navigate('/admin')
      return
    }
    loadCases(filter)
  }, [filter])

  async function loadCases(status) {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listGrievances(status || undefined)
      setCases(data)
    } catch (err) {
      if (err.message.includes('401')) {
        handleLogout()
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('grievance_admin_token')
    localStorage.removeItem('grievance_admin_user')
    navigate('/admin')
  }

  async function handleResolve(id, status, notes) {
    await api.updateStatus(id, status, notes)
    setSelected(null)
    loadCases(filter)
  }

  const username = localStorage.getItem('grievance_admin_user')

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 880 }}>
        <p className="eyebrow">Reviewing office</p>
        <h1 className="page-title">Case queue</h1>
        <p className="page-intro">
          Signed in as <strong>{username}</strong>.{' '}
          <button className="btn-ghost" style={{ border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', background: 'none', font: 'inherit', color: 'var(--ink-soft)' }} onClick={handleLogout}>
            Sign out
          </button>
        </p>

        <div className="admin-toolbar">
          <div className="admin-filters">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`chip ${filter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={() => loadCases(filter)}>
            Refresh
          </button>
        </div>

        {error && <div className="panel-error">{error}</div>}

        {loading ? (
          <p className="spinner-text">Loading cases…</p>
        ) : cases.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No cases here.</p>
            <p>Nothing matches this filter right now.</p>
          </div>
        ) : (
          cases.map((c) => (
            <div className="case-row" key={c.id} onClick={() => setSelected(c)}>
              <div className="case-row-top">
                <div>
                  <p className="case-row-code">{c.ticketId}</p>
                  <h3 className="case-row-subject">{c.subject}</h3>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="case-row-footer">
                <span>{c.fullName}</span>
                <span>{c.category}</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <CaseDetailModal
          grievance={selected}
          onClose={() => setSelected(null)}
          onResolve={handleResolve}
        />
      )}
    </main>
  )
}

function CaseDetailModal({ grievance, onClose, onResolve }) {
  const [status, setStatus] = useState(grievance.status)
  const [notes, setNotes] = useState(grievance.resolutionNotes || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await onResolve(grievance.id, statusToEnum(status), notes)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-panel-header">
          <div>
            <p className="ticket-stub-code">{grievance.ticketId}</p>
            <h2 className="ticket-stub-subject" style={{ fontSize: 22 }}>
              {grievance.subject}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ticket-stub-meta" style={{ marginBottom: 18 }}>
          <span>
            Filed by: <strong>{grievance.fullName}</strong>
          </span>
          <span>
            Email: <strong>{grievance.email}</strong>
          </span>
          <span>
            Category: <strong>{grievance.category}</strong>
          </span>
        </div>

        <div className="detail-desc">{grievance.description}</div>

        {error && <div className="panel-error">{error}</div>}

        <div className="field">
          <label htmlFor="status">Update status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="notes">Resolution note (visible to the person who filed this)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain what was found and what action was taken."
          />
        </div>

        <button className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save update'}
        </button>
      </div>
    </div>
  )
}

function statusToEnum(label) {
  return { Pending: 0, InProgress: 1, Resolved: 2, Rejected: 3 }[label]
}
