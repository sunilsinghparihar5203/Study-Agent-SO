import React from 'react'
import ReactDOM from 'react-dom/client'
import { app } from '../firebase.js'
import App from './App.jsx'
import './index.css'

// Make Firebase functions globally available
window.firebaseFunctions = {
  signInWithGoogle: () => import('../firebase.js').then(m => m.signInWithGoogle()),
  logoutUser: () => import('../firebase.js').then(m => m.logoutUser()),
  saveStudySession: (userId, data) => import('../firebase.js').then(m => m.saveStudySession(userId, data)),
  saveProgress: (userId, data) => import('../firebase.js').then(m => m.saveProgress(userId, data)),
  getUserProgress: (userId) => import('../firebase.js').then(m => m.getUserProgress(userId)),
  saveMockTestResult: (userId, data) => import('../firebase.js').then(m => m.saveMockTestResult(userId, data)),
  getMockTestHistory: (userId) => import('../firebase.js').then(m => m.getMockTestHistory(userId)),
  saveStudyNotes: (userId, notes) => import('../firebase.js').then(m => m.saveStudyNotes(userId, notes)),
  getStudyNotes: (userId) => import('../firebase.js').then(m => m.getStudyNotes(userId))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
