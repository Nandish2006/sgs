import { useState } from 'react'
import { api } from '../api'
import { StatusStamp } from '../components/StatusStamp'

export default function TrackPage() {
  const [ticketId, setTicketId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  async function handleLookup(e) {
    e.preventDefault()
    if (!ticketId.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await api.trackGrievance(ticketId.trim())
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <p className="eyebrow">Case lookup</p>
        <h1 className="page-title">Track your grievance</h1>
        <p className="page-intro">Enter the ticket ID you received when the case was filed.</p>

        <form className="lookup-row" onSubmit={handleLookup} style={{ marginBottom: 32 }}>
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="e.g. GRV-2026-00042"
            style={{ fontFamily: 'var(--font-mono)' }}
          />
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching…' : 'Track'}
          </button>
        </form>

        {error && <div className="panel-error">{error}</div>}

        {result && (
          <div className="ticket-stub">
            <div className="ticket-stub-main">
              <p className="ticket-stub-code">{result.ticketId}</p>
              <h2 className="ticket-stub-subject">{result.subject}</h2>
              <div className="ticket-stub-meta">
                <span>
                  Category: <strong>{result.category}</strong>
                </span>
                <span>
                  Filed: <strong>{new Date(result.createdAt).toLocaleDateString()}</strong>
                </span>
                <span>
                  Updated: <strong>{new Date(result.updatedAt).toLocaleDateString()}</strong>
                </span>
              </div>
              {result.resolutionNotes && (
                <div className="ticket-stub-notes">
                  <p className="ticket-stub-notes-label">Note from the reviewing office</p>
                  {result.resolutionNotes}
                </div>
              )}
            </div>
            <div className="ticket-stub-stamp-side">
              <StatusStamp status={result.status} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
