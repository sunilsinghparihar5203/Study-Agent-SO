import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import './App.css'

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard.jsx'))
const StudySession = lazy(() => import('./components/StudySession.jsx'))
const MockTest = lazy(() => import('./components/MockTest.jsx'))
const Progress = lazy(() => import('./components/Progress.jsx'))
const ComputerScience = lazy(() => import('./components/ComputerScience.jsx'))
const Auth = lazy(() => import('./components/Auth.jsx'))

function AppContent() {
  const location = useLocation()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading study agent...</p>
      </div>
    )
  }

  const showNavbar = location.pathname !== '/auth'

  return (
    <div className="app">
      {showNavbar && <Navbar />}

      <main className={`app-main ${showNavbar ? 'with-navbar' : 'full-height'}`}>
        <Suspense fallback={
          <div className="app-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        }>
          <Routes>
            <Route
              path="/auth"
              element={user ? <Navigate to="/" replace /> : <Auth />}
            />

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
        </Suspense>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
