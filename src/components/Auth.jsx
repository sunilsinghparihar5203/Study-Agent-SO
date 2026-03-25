import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { sanitizeEmail, validatePassword, rateLimit } from '../utils/security.js'
import './Auth.css'

function Auth() {
  const { user, loading } = useAuth()
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')

    try {
      // Rate limiting check
      rateLimit.check(formData.email)

      // Validate and sanitize inputs
      const sanitizedEmail = sanitizeEmail(formData.email)
      validatePassword(formData.password)

      // Check password confirmation for signup
      if (isSignUp && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      // Update form data with sanitized values
      const secureFormData = {
        ...formData,
        email: sanitizedEmail
      }

      const { signUpWithEmail, signInWithEmail } = await import('../../firebase.js')
      const user = isSignUp
        ? await signUpWithEmail(secureFormData.email, secureFormData.password)
        : await signInWithEmail(secureFormData.email, secureFormData.password)

      console.log('User authenticated:', user)

      if (user) {
        navigate(from, { replace: true })
      }

      // Initialize user data after successful sign in
      if (user) {
        const { initializeDefaultSubjects } = await import('../../firebase.js')
        initializeDefaultSubjects(user.uid)
          .then(() => {
            console.log('User data initialized for:', user.uid)
          })
          .catch((error) => {
            console.error('User data initialization error:', error)
          })

        // Clear rate limit on successful authentication
        rateLimit.clear(secureFormData.email)
      }
    } catch (error) {
      console.error('Authentication error:', error)

      // Handle security-related errors
      if (error.message.includes('Too many attempts')) {
        setError(error.message)
        return
      }

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
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.'
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
