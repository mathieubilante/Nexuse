import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'

import ModuleShell from '../components/ModuleShell.jsx'
import { MODULES } from '../data/modules.js'
import { AuthProvider, useAuth } from '../modules/matchpro/context/AuthContext.jsx'
import Register from '../modules/matchpro/pages/Register.jsx'
import Login from '../modules/matchpro/pages/Login.jsx'
import RoleSelect from '../modules/matchpro/pages/RoleSelect.jsx'
import CandidateProfile from '../modules/matchpro/pages/CandidateProfile.jsx'
import RecruiterProfile from '../modules/matchpro/pages/RecruiterProfile.jsx'
import MpDashboard from '../modules/matchpro/pages/MpDashboard.jsx'
import CandidateJobs from '../modules/matchpro/pages/CandidateJobs.jsx'
import MyApplications from '../modules/matchpro/pages/MyApplications.jsx'
import RecruiterJobs from '../modules/matchpro/pages/RecruiterJobs.jsx'



const module = MODULES.find((m) => m.id === 'matchpro')

function endsWith(pathname, suffix) {
  return pathname.endsWith(suffix)
}

function Gate({ children }) {
  const { user, token, isLoading } = useAuth()
  const location = useLocation()
  const path = location.pathname

  if (isLoading) {
    return <div className="mshell-placeholder">Chargement...</div>
  }

  // Not authenticated -> only allow register/login
  if (!token || !user) {
    if (endsWith(path, '/register') || endsWith(path, '/login')) {
      return children
    }
    return <Navigate to="/matchpro/login" replace />
  }

  // Authenticated but no role chosen yet -> only allow /role
  if (!user.role) {
    if (endsWith(path, '/role')) {
      return children
    }
    return <Navigate to="/matchpro/role" replace />
  }

  // Role chosen but profile not completed -> only allow /profile
  if (!user.profile_completed) {
    if (endsWith(path, '/profile')) {
      return children
    }
    return <Navigate to="/matchpro/profile" replace />
  }

  // Fully onboarded -> redirect away from onboarding pages
  if (
    endsWith(path, '/login') ||
    endsWith(path, '/register') ||
    endsWith(path, '/role') ||
    endsWith(path, '/profile')
  ) {
    return <Navigate to="/matchpro/dashboard" replace />
  }

  return children
}

function ProfileStep() {
  const { user } = useAuth()
  if (user?.role === 'recruteur') return <RecruiterProfile />
  return <CandidateProfile />
}

function MatchProRoutes() {
  return (
    <Gate>
      <Routes>
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="role" element={<RoleSelect />} />
        <Route path="profile" element={<ProfileStep />} />
        <Route path="dashboard" element={<MpDashboard />} />
        <Route path="jobs" element={ <CandidateJobs /> } />
        <Route path="my-applications" element={ <MyApplications /> } />
        <Route path="recruiter/jobs" element={ <RecruiterJobs /> } />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </Gate>
  )
}


export default function MatchPro() {
  return (
    <ModuleShell module={module}>
      <AuthProvider>
        <MatchProRoutes />
      </AuthProvider>
    </ModuleShell>
  )
}
