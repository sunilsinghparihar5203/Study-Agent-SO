import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Progress.css'

function Progress() {
  const [progressData, setProgressData] = useState({
    weeklyStats: [],
    subjectProgress: {},
    overallAccuracy: 0,
    studyTime: 0,
    weakAreas: [],
    strongAreas: []
  })

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    // Mock data - replace with API call
    const mockData = {
      weeklyStats: [
        { day: 'Mon', studyTime: 120, questions: 45, accuracy: 78 },
        { day: 'Tue', studyTime: 90, questions: 35, accuracy: 82 },
        { day: 'Wed', studyTime: 150, questions: 60, accuracy: 75 },
        { day: 'Thu', studyTime: 110, questions: 40, accuracy: 85 },
        { day: 'Fri', studyTime: 130, questions: 50, accuracy: 80 },
        { day: 'Sat', studyTime: 180, questions: 70, accuracy: 77 },
        { day: 'Sun', studyTime: 60, questions: 25, accuracy: 88 }
      ],
      subjectProgress: {
        'Reasoning': { accuracy: 75, questions: 200, timeSpent: 480 },
        'Quantitative Aptitude': { accuracy: 82, questions: 180, timeSpent: 420 },
        'English Language': { accuracy: 68, questions: 150, timeSpent: 360 },
        'Professional Knowledge': { accuracy: 70, questions: 120, timeSpent: 300 },
        'Computer Awareness': { accuracy: 85, questions: 80, timeSpent: 180 }
      },
      overallAccuracy: 76,
      studyTime: 1740, // total minutes this week
      weakAreas: ['English Language - Reading Comprehension', 'Professional Knowledge - Banking Regulations'],
      strongAreas: ['Computer Awareness', 'Quantitative Aptitude - Percentage']
    }
    setProgressData(mockData)
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return '#28a745'
    if (accuracy >= 70) return '#ffc107'
    if (accuracy >= 60) return '#fd7e14'
    return '#dc3545'
  }

  return (
    <div className="progress">
      <div className="progress-header">
        <h2>Your Progress</h2>
        <div className="overall-stats">
          <div className="stat-card">
            <h3>Overall Accuracy</h3>
            <div className="accuracy-display" style={{color: getAccuracyColor(progressData.overallAccuracy)}}>
              {progressData.overallAccuracy}%
            </div>
          </div>
          <div className="stat-card">
            <h3>Total Study Time</h3>
            <div className="time-display">
              {Math.floor(progressData.studyTime / 60)}h {progressData.studyTime % 60}m
            </div>
          </div>
        </div>
      </div>

      <div className="progress-content">
        <div className="weekly-chart">
          <h3>Weekly Performance</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {progressData.weeklyStats.map((stat, index) => (
                <div key={index} className="bar-container">
                  <div className="bar-label">{stat.day}</div>
                  <div className="bar-wrapper">
                    <div className="bar">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          height: `${(stat.studyTime / 180) * 100}%`,
                          backgroundColor: getAccuracyColor(stat.accuracy)
                        }}
                      ></div>
                    </div>
                    <div className="bar-value">{stat.studyTime}min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="subject-progress">
          <h3>Subject-wise Progress</h3>
          <div className="subject-cards">
            {Object.entries(progressData.subjectProgress).map(([subject, data]) => (
              <div key={subject} className="subject-card">
                <h4>{subject}</h4>
                <div className="subject-stats">
                  <div className="progress-item">
                    <span>Accuracy</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${data.accuracy}%`,
                          backgroundColor: getAccuracyColor(data.accuracy)
                        }}
                      ></div>
                    </div>
                    <span>{data.accuracy}%</span>
                  </div>
                  <div className="progress-item">
                    <span>Questions</span>
                    <span>{data.questions}</span>
                  </div>
                  <div className="progress-item">
                    <span>Time</span>
                    <span>{Math.floor(data.timeSpent / 60)}h {data.timeSpent % 60}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="areas-analysis">
          <div className="analysis-card weak-areas">
            <h3>Areas to Improve</h3>
            <ul>
              {progressData.weakAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
            <Link to="/study" className="btn btn-primary">
              Practice These Areas
            </Link>
          </div>
          
          <div className="analysis-card strong-areas">
            <h3>Your Strengths</h3>
            <ul>
              {progressData.strongAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
            <button className="btn btn-secondary">
              Focus on Advanced Topics
            </button>
          </div>
        </div>
      </div>

      <div className="progress-footer">
        <Link to="/" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Progress
