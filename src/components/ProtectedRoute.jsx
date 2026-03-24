import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { auth, onAuthStateChanged } = await import('../../firebase.js')
        const unsubscribe = onAuthStateChanged(auth, (user) => {
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
      unsubscribe.then(unsub => unsub && unsub())
    }
  }, [])

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

export default ProtectedRoute
