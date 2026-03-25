import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { auth, onAuthStateChanged } = await import('../../firebase.js')

        if (!auth) {
          console.warn('Firebase not configured - running in demo mode')
          setLoading(false)
          return
        }

        console.log('Setting up auth listener...')
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user')
          setUser(user)
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      }
    }

    const unsubscribe = initializeAuth()
    return () => {
      unsubscribe.then(unsub => {
        if (unsub) unsub()
      })
    }
  }, [])

  const value = {
    user,
    loading,
    setUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
