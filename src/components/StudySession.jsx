import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './StudySession.css'

function StudySession() {
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const subjects = [
    {
      name: 'Reasoning',
      topics: ['Logical Reasoning', 'Syllogism', 'Blood Relations', 'Coding-Decoding', 'Series', 'Analogy']
    },
    {
      name: 'Quantitative Aptitude',
      topics: ['Percentage', 'Profit & Loss', 'Simple Interest', 'Time & Work', 'Time & Distance', 'Averages']
    },
    {
      name: 'English Language',
      topics: ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Synonyms', 'Antonyms', 'Idioms']
    },
    {
      name: 'Professional Knowledge',
      topics: ['Banking Basics', 'Indian Economy', 'Financial Markets', 'Banking Regulations', 'Current Affairs']
    },
    {
      name: 'Computer Awareness',
      topics: ['Computer Fundamentals', 'MS Office', 'Internet', 'Security', 'Software & Hardware']
    }
  ]

  useEffect(() => {
    let interval
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const generateQuestions = async () => {
    if (!selectedSubject || !selectedTopic) return

    // Mock question generation - replace with AI API
    const mockQuestions = [
      {
        id: 1,
        question: `If A = 30% of B, B = 25% of C, and C = 20% of D, then what is A in terms of D?`,
        options: ['1.5% of D', '2.5% of D', '3% of D', '4% of D'],
        correct: 0,
        explanation: 'A = 0.3 × B = 0.3 × 0.25 × C = 0.075 × C = 0.075 × 0.2 × D = 0.015 × D = 1.5% of D'
      },
      {
        id: 2,
        question: 'A shopkeeper sells an article at 20% profit. If the cost price is ₹500, what is the selling price?',
        options: ['₹400', '₹500', '₹600', '₹700'],
        correct: 2,
        explanation: 'Selling Price = Cost Price × (1 + Profit%/100) = 500 × (1 + 20/100) = 500 × 1.2 = ₹600'
      }
    ]

    setQuestions(mockQuestions)
    setCurrentQuestion(0)
    setAnswers([])
    setShowResult(false)
    setTimer(0)
    setIsTimerRunning(true)
  }

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setIsTimerRunning(false)
      setShowResult(true)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correct++
      }
    })
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    }
  }

  const score = showResult ? calculateScore() : null

  return (
    <div className="study-session">
      <div className="session-header">
        <h2>Study Session</h2>
        {timer > 0 && (
          <div className="timer">
            Time: {formatTime(timer)}
          </div>
        )}
      </div>

      {!questions.length ? (
        <div className="topic-selection">
          <h3>Select Subject and Topic</h3>
          
          <div className="selection-grid">
            <div className="subject-selector">
              <label>Subject:</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Choose a subject</option>
                {subjects.map(subject => (
                  <option key={subject.name} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubject && (
              <div className="topic-selector">
                <label>Topic:</label>
                <select 
                  value={selectedTopic} 
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  <option value="">Choose a topic</option>
                  {subjects
                    .find(s => s.name === selectedSubject)
                    ?.topics.map(topic => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {selectedSubject && selectedTopic && (
            <button 
              className="btn btn-primary"
              onClick={generateQuestions}
            >
              Start Practice
            </button>
          )}
        </div>
      ) : showResult ? (
        <div className="results">
          <h3>Session Complete!</h3>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-percentage">{score.percentage}%</span>
            </div>
            <div className="score-details">
              <p>Correct: {score.correct} / {score.total}</p>
              <p>Time Taken: {formatTime(timer)}</p>
            </div>
          </div>
          
          <div className="result-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setQuestions([])
                setSelectedSubject('')
                setSelectedTopic('')
              }}
            >
              New Topic
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setCurrentQuestion(0)
                setAnswers([])
                setShowResult(false)
                setTimer(0)
                setIsTimerRunning(true)
              }}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="question-container">
          <div className="question-progress">
            Question {currentQuestion + 1} of {questions.length}
          </div>

          <div className="question-card">
            <h3>{questions[currentQuestion].question}</h3>
            
            <div className="options">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index)}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="session-footer">
        <Link to="/" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default StudySession
