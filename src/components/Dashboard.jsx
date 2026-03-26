import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import './Dashboard.css'

function Dashboard() {
  const { user } = useAuth()
  const [dailyPlan, setDailyPlan] = useState(null)
  const [stats, setStats] = useState({
    studyTime: 0,
    questionsAnswered: 0,
    accuracy: 0,
    streak: 0
  })
  const [subjects, setSubjects] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
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
      const { getDashboardSummary } = await import('../../firebase.js')
      const summary = await getDashboardSummary(userId)

      setStats({
        studyTime: summary.totals.studyMinutes,
        questionsAnswered: summary.totals.questionsAnswered,
        accuracy: summary.totals.accuracy,
        streak: summary.totals.streak
      })

      setSubjects(summary.subjects || [])
      setRecentActivity(summary.recentActivity || [])
    } catch (error) {
      console.error('Error loading stats:', error)
      // Fallback to empty states
      setStats({
        studyTime: 0,
        questionsAnswered: 0,
        accuracy: 0,
        streak: 0
      })
      setSubjects([])
      setRecentActivity([])
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
              <Link to="/ai-study-plan" className="btn">AI Study Plan</Link>
              <Link to="/computer-science" className="btn">Computer Science</Link>
              <Link to="/progress" className="btn">View Progress</Link>
            </div>
          </div>

          <div className="card recent-activity">
            <h3>Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <span className="activity-type">{activity.title}</span>
                    <span className="activity-time">
                      {activity.timestamp ? new Date(activity.timestamp.toDate ? activity.timestamp.toDate() : activity.timestamp).toLocaleString() : 'Unknown time'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recent activity</p>
            )}
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
