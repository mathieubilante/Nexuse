import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../api.js'

const STORAGE_KEY = 'matchpro_token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const data = await apiFetch('/api/auth/me', { token: currentToken })
      setUser(data.user)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser(token)
  }, [token, loadUser])

  const register = async (email, password) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const login = async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const setRole = async (role) => {
    const data = await apiFetch('/api/auth/role', {
      method: 'POST',
      token,
      body: JSON.stringify({ role }),
    })
    setUser(data.user)
    return data.user
  }

  const updateProfile = async (profileData) => {
    const data = await apiFetch('/api/users/me/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify(profileData),
    })
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, register, login, setRole, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
