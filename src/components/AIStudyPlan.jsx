import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import toast from 'react-hot-toast'
import './AIStudyPlan.css'

function AIStudyPlan() {
  const { user } = useAuth()
  const [studyPlan, setStudyPlan] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopics, setSelectedTopics] = useState([])
  const [duration, setDuration] = useState(7)

  const subjects = [
    {
      id: 'computer-science',
      name: 'Computer Science',
      topics: ['Data Structures', 'Algorithms', 'Database Management', 'Computer Networks', 'Operating Systems', 'Web Technologies']
    },
    {
      id: 'programming',
      name: 'Programming & Algorithms',
      topics: ['Data Structures', 'Algorithms', 'Time Complexity', 'Sorting', 'Searching', 'Dynamic Programming']
    },
    {
      id: 'databases',
      name: 'Database Management',
      topics: ['SQL', 'NoSQL', 'Normalization', 'Transactions', 'Indexing', 'Query Optimization']
    }
  ]

  const currentSubject = subjects.find(s => s.id === selectedSubject)

  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find(s => s.id === selectedSubject)
      setSelectedTopics(subject?.topics || [])
    }
  }, [selectedSubject])

  const generateStudyPlan = async () => {
    if (!selectedSubject || selectedTopics.length === 0) {
      toast.error('Please select subject and topics')
      return
    }

    setLoading(true)
    try {
      const geminiService = await import('../services/geminiService.js').then(m => m.default)
      
      const plan = await geminiService.generateStudyPlan(
        currentSubject.name,
        selectedTopics,
        duration
      )

      setStudyPlan(plan)
      toast.success('Study plan generated successfully!')
    } catch (error) {
      console.error('Error generating study plan:', error)
      toast.error('Failed to generate study plan')
    } finally {
      setLoading(false)
    }
  }

  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    )
  }

  return (
    <div className="ai-study-plan">
      <div className="plan-header">
        <h2>AI Study Plan Generator</h2>
        <p>Generate personalized study plans using Gemini AI</p>
      </div>

      <div className="plan-form">
        <div className="form-group">
          <label>Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="form-select"
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Topics</label>
          <div className="topics-checkbox">
            {currentSubject?.topics.map(topic => (
              <label key={topic} className="topic-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic)}
                  onChange={() => handleTopicToggle(topic)}
                />
                <span>{topic}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Duration (days)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            min="1"
            max="30"
            className="form-input"
          />
        </div>

        <button 
          onClick={generateStudyPlan}
          disabled={loading || !selectedSubject || selectedTopics.length === 0}
          className="btn btn-primary"
        >
          {loading ? 'Generating...' : 'Generate Study Plan'}
        </button>
      </div>

      {studyPlan.length > 0 && (
        <div className="plan-results">
          <h3>Your Personalized Study Plan</h3>
          <div className="plan-timeline">
            {studyPlan.map((day, index) => (
              <div key={index} className="plan-day">
                <div className="day-header">
                  <span className="day-number">Day {day.day}</span>
                  <span className="day-time">{day.timeEstimate}</span>
                </div>
                <div className="day-content">
                  <h4>{day.topic}</h4>
                  <p>{day.description}</p>
                  {day.keyPoints && (
                    <ul className="key-points">
                      {day.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIStudyPlan
