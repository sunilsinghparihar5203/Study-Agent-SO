import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import './Dashboard.css'

function Dashboard() {
  const { user } = useAuth()
  const [dailyPlan, setDailyPlan] = useState(null)
  const [stats, setStats] = useState({
    studyTime: 45,
    questionsAnswered: 23,
    accuracy: 87,
    streak: 3
  })
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Reasoning', progress: 75 },
    { id: 2, name: 'Quantitative Aptitude', progress: 60 },
    { id: 3, name: 'English Language', progress: 85 },
    { id: 4, name: 'Computer Knowledge', progress: 40 },
    { id: 5, name: 'Banking Awareness', progress: 90 }
  ])
  const [loading, setLoading] = useState(false) // Start with false to show content immediately

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user) {
        console.log('No user found, skipping dashboard initialization')
        return
      }

      console.log('Initializing dashboard for user:', user.email)
      setLoading(true)

      try {
        // Set default data immediately
        setDailyPlan({
          morning: {
            subject: 'Reasoning',
            topics: ['Syllogism', 'Blood Relations'],
            time: '9:00 AM - 11:00 AM'
          },
          afternoon: {
            subject: 'Quantitative Aptitude',
            topics: ['Percentage', 'Profit & Loss'],
            time: '2:00 PM - 4:00 PM'
          },
          evening: {
            subject: 'English Language',
            topics: ['Reading Comprehension', 'Vocabulary'],
            time: '7:00 PM - 9:00 PM'
          }
        })

        // Try to load from Firebase but don't block display
        Promise.all([
          loadDailyPlan(user.uid),
          loadStats(user.uid),
          loadSubjects(user.uid)
        ]).catch(error => {
          console.log('Firebase loading failed, using default data:', error)
        })
      } catch (error) {
        console.error('Dashboard initialization error:', error)
      } finally {
        // Always set loading to false
        setTimeout(() => setLoading(false), 500)
      }
    }

    initializeDashboard()
  }, [user])

  const initializeUserData = async (userId) => {
    try {
      const { getUserSubjects, initializeDefaultSubjects } = await import('../../firebase.js')

      // Check if user already has subjects
      const existingSubjects = await getUserSubjects(userId)

      if (existingSubjects.length === 0) {
        // Initialize default subjects for new users
        await initializeDefaultSubjects(userId)
        console.log('Default subjects initialized for user:', userId)
      }
    } catch (error) {
      console.error('Error initializing user data:', error)
    }
  }

  const loadDailyPlan = async (userId) => {
    try {
      // Mock data - replace with API call to generate personalized plan
      const plan = {
        morning: {
          subject: 'Reasoning',
          topics: ['Syllogism', 'Blood Relations'],
          time: '9:00 AM - 11:00 AM'
        },
        afternoon: {
          subject: 'Quantitative Aptitude',
          topics: ['Percentage', 'Profit & Loss'],
          time: '2:00 PM - 4:00 PM'
        },
        evening: {
          subject: 'English Language',
          topics: ['Reading Comprehension', 'Vocabulary'],
          time: '7:00 PM - 9:00 PM'
        }
      }

      // Save daily plan to Firebase
      const { saveStudySession } = await import('../../firebase.js')
      await saveStudySession(userId, {
        type: 'daily_plan',
        plan: plan,
        date: new Date().toISOString().split('T')[0]
      })

      setDailyPlan(plan)
    } catch (error) {
      console.error('Error loading daily plan:', error)
      // Set fallback data
      setDailyPlan({
        morning: {
          subject: 'Reasoning',
          topics: ['Syllogism', 'Blood Relations'],
          time: '9:00 AM - 11:00 AM'
        },
        afternoon: {
          subject: 'Quantitative Aptitude',
          topics: ['Percentage', 'Profit & Loss'],
          time: '2:00 PM - 4:00 PM'
        },
        evening: {
          subject: 'English Language',
          topics: ['Reading Comprehension', 'Vocabulary'],
          time: '7:00 PM - 9:00 PM'
        }
      })
    }
  }

  const loadStats = async (userId) => {
    try {
      const { getAllProgress, getStudySessions } = await import('../../firebase.js')

      // Get user progress and sessions
      const [progressData, sessionsData] = await Promise.all([
        getAllProgress(userId),
        getStudySessions(userId, 7) // Last 7 sessions
      ])

      // Calculate stats from real data
      const totalStudyTime = sessionsData.reduce((total, session) => {
        return total + (session.duration || 0)
      }, 0)

      const totalQuestions = progressData.reduce((total, progress) => {
        return total + (progress.questionsAnswered || 0)
      }, 0)

      const correctAnswers = progressData.reduce((total, progress) => {
        return total + (progress.correctAnswers || 0)
      }, 0)

      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

      // Calculate streak (consecutive days with activity)
      const today = new Date()
      let streak = 0
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateStr = checkDate.toISOString().split('T')[0]

        const hasActivity = sessionsData.some(session =>
          session.timestamp.toDate().toISOString().split('T')[0] === dateStr
        )

        if (hasActivity) {
          streak++
        } else if (i > 0) {
          break
        }
      }

      const userStats = {
        studyTime: Math.round(totalStudyTime / 60), // Convert to minutes
        questionsAnswered: totalQuestions,
        accuracy: accuracy,
        streak: streak
      }

      setStats(userStats)
    } catch (error) {
      console.error('Error loading stats:', error)
      // Fallback to mock data
      setStats({
        studyTime: 120,
        questionsAnswered: 45,
        accuracy: 78,
        streak: 5
      })
    }
  }

  const loadSubjects = async (userId) => {
    try {
      const { getUserSubjects } = await import('../../firebase.js')
      const userSubjects = await getUserSubjects(userId)
      setSubjects(userSubjects)
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }

  const handleSubjectClick = useCallback(async (subject) => {
    try {
      const { saveTopicProgress } = await import('../../firebase.js')
      const { auth } = await import('../../firebase.js')
      const userId = auth.currentUser?.uid

      if (userId) {
        await saveTopicProgress(userId, {
          subjectId: subject.id,
          topicId: 'overview',
          subtopicId: 'intro',
          isCompleted: true,
          timeSpent: 5,
          accuracy: 100
        })

        // Update local state
        setSubjects(prev => prev.map(s =>
          s.id === subject.id
            ? { ...s, progress: Math.min(s.progress + 5, 100) }
            : s
        ))
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }, [])

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Welcome to Your IT Officer Study Dashboard</h2>
          <p>Your personalized AI-powered study companion for exam preparation</p>
        </div>

        <div className="dashboard-grid">
          <div className="card study-plan">
            <h3>Today's Study Plan</h3>
            {dailyPlan ? (
              <div className="plan-content">
                <div className="time-slot">
                  <strong>Morning:</strong> {dailyPlan.morning.time}
                  <p>{dailyPlan.morning.subject}</p>
                  <small>{dailyPlan.morning.topics.join(', ')}</small>
                </div>
                <div className="time-slot">
                  <strong>Afternoon:</strong> {dailyPlan.afternoon.time}
                  <p>{dailyPlan.afternoon.subject}</p>
                  <small>{dailyPlan.afternoon.topics.join(', ')}</small>
                </div>
                <div className="time-slot">
                  <strong>Evening:</strong> {dailyPlan.evening.time}
                  <p>{dailyPlan.evening.subject}</p>
                  <small>{dailyPlan.evening.topics.join(', ')}</small>
                </div>
              </div>
            ) : (
              <p>Loading your study plan...</p>
            )}
          </div>

          <div className="card progress-overview">
            <h3>Today's Progress</h3>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">Study Time</span>
                <span className="stat-value">{stats.studyTime} min</span>
              </div>
              <div className="stat">
                <span className="stat-label">Questions</span>
                <span className="stat-value">{stats.questionsAnswered}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{stats.accuracy}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">Streak</span>
                <span className="stat-value">{stats.streak} days</span>
              </div>
            </div>
          </div>

          <div className="card quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <Link to="/study" className="btn btn-primary">Start Study Session</Link>
              <Link to="/test" className="btn btn-secondary">Take Mock Test</Link>
              <Link to="/computer-science" className="btn">Computer Science</Link>
              <Link to="/progress" className="btn">View Progress</Link>
            </div>
          </div>

          <div className="card performance-stats">
            <h3>Performance Overview</h3>
            <div className="performance-chart">
              <div className="subject-performance">
                <h4>Subject-wise Performance</h4>
                <div className="progress-bar">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="progress-item">
                      <span>{subject.name}</span>
                      <div className="progress">
                        <div
                          className="progress-fill"
                          style={{ width: `${subject.progress || 0}%` }}
                        ></div>
                      </div>
                      <span>{subject.progress || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card subjects-overview">
            <h3>Your Subjects</h3>
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="subject-card"
                  onClick={() => handleSubjectClick(subject)}
                >
                  <div className="subject-header">
                    <h4>{subject.name}</h4>
                    <span className="subject-weightage">{subject.weightage}%</span>
                  </div>
                  <p className="subject-description">{subject.description}</p>
                  <div className="subject-progress">
                    <div className="progress">
                      <div
                        className="progress-fill"
                        style={{ width: `${subject.progress || 0}%` }}
                      ></div>
                    </div>
                    <span>{subject.progress || 0}% Complete</span>
                  </div>
                  <div className="subject-topics">
                    <small>{subject.topics?.length || 0} topics</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
