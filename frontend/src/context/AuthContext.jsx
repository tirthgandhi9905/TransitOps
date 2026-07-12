import React, { createContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'
import { PAGE_ACCESS } from '../utils/constants'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Re-hydrate session from stored JWT on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    getMe()
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const loginUser = (userData, token) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const logoutUser = () => {
    localStorage.removeItem('token')
    setUser(null)
    // toast import avoided here to prevent circular dep — Login handles its own toasts
  }

  /** Returns true if the current user can see the page at all */
  const canAccess = (page) => {
    if (!user) return false
    const access = PAGE_ACCESS[page]?.[user.role]
    return access === 'full' || access === 'view'
  }

  /** Returns true only if the current user has write access */
  const canEdit = (page) => {
    if (!user) return false
    return PAGE_ACCESS[page]?.[user.role] === 'full'
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, canAccess, canEdit }}>
      {children}
    </AuthContext.Provider>
  )
}