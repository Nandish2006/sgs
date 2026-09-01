import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SubmitPage from './pages/SubmitPage'
import TrackPage from './pages/TrackPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<SubmitPage />} />
        <Route path="/track" element={<TrackPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </div>
  )
}
