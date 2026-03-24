import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import Dashboard from './components/Dashboard.jsx'
import StudySession from './components/StudySession.jsx'
import MockTest from './components/MockTest.jsx'
import Progress from './components/Progress.jsx'
import ComputerScience from './components/ComputerScience.jsx'
import Auth from './components/Auth.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { auth, onAuthStateChanged } = await import('../firebase.js')
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
        })
        return unsubscribe
      } catch (error) {
        console.error('Firebase initialization error:', error)
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
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading study agent...</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>SBI IT Officer Study Agent</h1>
          <nav>
            <a href="/">Dashboard</a>
            <a href="/study">Study</a>
            <a href="/computer-science">Computer Science</a>
            <a href="/test">Mock Test</a>
            <a href="/progress">Progress</a>
            {user ? (
              <div className="user-info">
                <span>Welcome, {user.displayName || user.email}</span>
                <button onClick={() => window.firebaseFunctions.logoutUser()}>
                  Logout
                </button>
              </div>
            ) : (
              <a href="/auth" className="sign-in-btn">
                Sign In
              </a>
            )}
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/auth" element={<Auth />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/study" element={
              <ProtectedRoute>
                <StudySession />
              </ProtectedRoute>
            } />

            <Route path="/computer-science" element={
              <ProtectedRoute>
                <ComputerScience />
              </ProtectedRoute>
            } />

            <Route path="/test" element={
              <ProtectedRoute>
                <MockTest />
              </ProtectedRoute>
            } />

            <Route path="/progress" element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
