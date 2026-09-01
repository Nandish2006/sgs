import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, CATEGORY_OPTIONS } from '../api'

const initialForm = {
  fullName: '',
  email: '',
  category: 0,
  subject: '',
  description: '',
}

export default function SubmitPage() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [ticket, setTicket] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await api.createGrievance({
        ...form,
        category: Number(form.category),
      })
      setTicket(result.ticketId)
      setForm(initialForm)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (ticket) {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: 600 }}>
          <p className="eyebrow">Docket opened</p>
          <h1 className="page-title">Your grievance has been filed.</h1>
          <div className="docket">
            <p style={{ marginTop: 0 }}>Keep this ticket ID to check your case status at any time:</p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--seal-dark)',
                margin: '4px 0 24px',
              }}
            >
              {ticket}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/track" className="btn btn-primary">
                Track this case
              </Link>
              <button className="btn btn-ghost" onClick={() => setTicket(null)}>
                File another
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <p className="eyebrow">New case docket</p>
        <h1 className="page-title">File a grievance</h1>
        <p className="page-intro">
          Describe the issue clearly and specifically — the details you give here are what the
          reviewing office will act on. You'll receive a ticket ID to track progress.
        </p>

        {error && <div className="panel-error">{error}</div>}

        <form className="docket" onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="As per college records"
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@vitbhopal.ac.in"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              required
              maxLength={150}
              value={form.subject}
              onChange={(e) => update('subject', e.target.value)}
              placeholder="One line summarizing the issue"
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              required
              maxLength={2000}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="What happened, when, and where. Include any relevant names, dates, or reference numbers."
            />
            <p className="field-hint">{form.description.length}/2000 characters</p>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Filing…' : 'Submit grievance'}
          </button>
        </form>
      </div>
    </main>
  )
}
