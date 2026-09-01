import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark" />
          The Docket
          <span className="brand-tag">Grievance Redressal</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            File a Grievance
          </NavLink>
          <NavLink to="/track" className={({ isActive }) => (isActive ? 'active' : '')}>
            Track Status
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
