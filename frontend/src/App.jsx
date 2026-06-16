import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import MatchPro from './pages/MatchPro.jsx'
import VivoConnect from './pages/VivoConnect.jsx'
import Aia from './pages/Aia.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/matchpro/*" element={<MatchPro />} />
        <Route path="/vivoconnect" element={<VivoConnect />} />
        <Route path="/aia" element={<Aia />} />
      </Routes>
    </div>
  )
}
