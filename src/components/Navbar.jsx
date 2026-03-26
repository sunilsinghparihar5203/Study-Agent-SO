import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import './Navbar.css'

function Navbar() {
  const { user } = useAuth()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('../../firebase.js')
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="navbar">
      <div className="app-container">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1>SBI IT Officer Study Agent</h1>
          </div>

          <nav className="navbar-nav">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/study"
              className={`nav-link ${isActive('/study') ? 'active' : ''}`}
            >
              Study
            </Link>
            <Link
              to="/computer-science"
              className={`nav-link ${isActive('/computer-science') ? 'active' : ''}`}
            >
              Computer Science
            </Link>
            <Link
              to="/notes"
              className={`nav-link ${isActive('/notes') ? 'active' : ''}`}
            >
              Notes
            </Link>
            <Link
              to="/test"
              className={`nav-link ${isActive('/test') ? 'active' : ''}`}
            >
              Mock Test
            </Link>
            <Link
              to="/progress"
              className={`nav-link ${isActive('/progress') ? 'active' : ''}`}
            >
              Progress
            </Link>
          </nav>

          <div className="navbar-user">
            {user ? (
              <div className="user-menu">
                <div className="user-avatar">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="user-dropdown">
                  <span className="user-name">
                    {user.displayName || user.email}
                  </span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="login-btn">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default React.memo(Navbar)
