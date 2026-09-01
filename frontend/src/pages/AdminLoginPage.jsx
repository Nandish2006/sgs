import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.login(username, password)
      localStorage.setItem('grievance_admin_token', res.token)
      localStorage.setItem('grievance_admin_user', res.username)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 440 }}>
        <p className="eyebrow">Reviewing office</p>
        <h1 className="page-title">Admin sign-in</h1>
        <p className="page-intro">Sign in to review, triage, and resolve filed grievances.</p>

        {error && <div className="panel-error">{error}</div>}

        <form className="docket" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="field-hint" style={{ marginTop: 16 }}>
            Default seeded credentials: <strong>admin</strong> / <strong>Admin@123</strong>
          </p>
        </form>
      </div>
    </main>
  )
}
