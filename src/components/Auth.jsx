import React, { useState, useEffect } from 'react'
import './Auth.css'

function Auth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { auth, onAuthStateChanged } = await import('../../firebase.js')

        // Check if Firebase is properly configured
        if (!auth) {
          console.warn('Firebase not configured - running in demo mode')
          setLoading(false)
          return
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
        })
        return unsubscribe
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Don't set error for Firebase config issues - just continue in demo mode
        setLoading(false)
      }
    }

    const unsubscribe = initializeAuth()
    return () => {
      unsubscribe.then(unsub => unsub && unsub())
    }
  }, [])

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const { signUpWithEmail, signInWithEmail } = await import('../../firebase.js')
      const user = isSignUp
        ? await signUpWithEmail(formData.email, formData.password)
        : await signInWithEmail(formData.email, formData.password)

      setUser(user)
      console.log('User authenticated:', user)

      // Initialize user data after successful sign in
      if (user) {
        const { initializeDefaultSubjects } = await import('../../firebase.js')
        await initializeDefaultSubjects(user.uid)
        console.log('User data initialized for:', user.uid)
      }
    } catch (error) {
      console.error('Authentication error:', error)
      let errorMessage = 'Authentication failed'

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already registered. Please sign in.'
          break
        case 'auth/user-not-found':
          errorMessage = 'User not found. Please check your email.'
          break
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.'
          break
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.'
          break
        default:
          errorMessage = error.message || 'Authentication failed'
      }

      setError(errorMessage)
    }
  }

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError('Please enter your email address')
      return
    }

    try {
      const { resetPassword } = await import('../../firebase.js')
      await resetPassword(formData.email)
      setError('Password reset email sent! Check your inbox.')
    } catch (error) {
      console.error('Password reset error:', error)
      setError('Failed to send password reset email')
    }
  }

  const handleLogout = async () => {
    try {
      setError('')
      const { logoutUser } = await import('../../firebase.js')
      await logoutUser()
      setUser(null)
      console.log('User logged out')
    } catch (error) {
      console.error('Logout error:', error)
      setError('Failed to logout')
    }
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-loading">
          <div className="loading-spinner"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="auth-container">
        <div className="auth-profile">
          <div className="user-info">
            {user.photoURL && (
              <img src={user.photoURL} alt="Profile" className="profile-pic" />
            )}
            <div className="user-details">
              <h3>{user.displayName || 'User'}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="auth-actions">
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>Welcome to SBI IT Officer Study Agent</h2>
          <p>{isSignUp ? 'Create your account to start studying' : 'Sign in to continue your learning journey'}</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="auth-form-content">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
              minLength="6"
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                required
                minLength="6"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          {!isSignUp && (
            <button type="button" onClick={handlePasswordReset} className="btn btn-link">
              Forgot Password?
            </button>
          )}
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-toggle">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="btn btn-link"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>

        <div className="auth-features">
          <h3>Why sign up?</h3>
          <ul>
            <li>📚 Save your study progress</li>
            <li>📊 Track performance analytics</li>
            <li>📝 Access your notes anywhere</li>
            <li>🎯 Personalized study recommendations</li>
            <li>🏆 Earn achievements and badges</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Auth
