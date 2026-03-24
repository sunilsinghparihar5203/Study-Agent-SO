import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './MockTest.css'

function MockTest() {
  const [testStarted, setTestStarted] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timer, setTimer] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const testSections = [
    {
      name: 'Reasoning',
      questions: 50,
      time: 40,
      color: '#667eea'
    },
    {
      name: 'Quantitative Aptitude',
      questions: 50,
      time: 40,
      color: '#28a745'
    },
    {
      name: 'English Language',
      questions: 40,
      time: 30,
      color: '#ffc107'
    },
    {
      name: 'Professional Knowledge',
      questions: 50,
      time: 35,
      color: '#17a2b8'
    },
    {
      name: 'Computer Awareness',
      questions: 20,
      time: 15,
      color: '#dc3545'
    }
  ]

  useEffect(() => {
    let interval
    if (testStarted && !showResults) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [testStarted, showResults])

  const startTest = () => {
    setTestStarted(true)
    setTimer(0)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = (questionIndex, answer) => {
    setAnswers({
      ...answers,
      [`${currentSection}-${questionIndex}`]: answer
    })
  }

  const nextQuestion = () => {
    if (currentQuestion < testSections[currentSection].questions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const nextSection = () => {
    if (currentSection < testSections.length - 1) {
      setCurrentSection(currentSection + 1)
      setCurrentQuestion(0)
    }
  }

  const finishTest = () => {
    setShowResults(true)
  }

  const calculateResults = () => {
    // Mock calculation - replace with actual scoring logic
    const totalQuestions = testSections.reduce((sum, section) => sum + section.questions, 0)
    const correctAnswers = Math.floor(totalQuestions * 0.75) // Mock: 75% accuracy
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    
    return {
      totalQuestions,
      correctAnswers,
      percentage,
      sectionWise: testSections.map(section => ({
        name: section.name,
        questions: section.questions,
        correct: Math.floor(section.questions * 0.75),
        percentage: 75
      }))
    }
  }

  const results = showResults ? calculateResults() : null

  if (!testStarted) {
    return (
      <div className="mock-test">
        <div className="test-intro">
          <h2>SBI SO Mock Test</h2>
          <div className="test-info">
            <div className="info-grid">
              {testSections.map((section, index) => (
                <div key={index} className="info-card" style={{borderLeftColor: section.color}}>
                  <h4 style={{color: section.color}}>{section.name}</h4>
                  <p>Questions: {section.questions}</p>
                  <p>Time: {section.time} minutes</p>
                  <p>Marks: {section.questions}</p>
                </div>
              ))}
            </div>
            
            <div className="test-summary">
              <h3>Test Summary</h3>
              <p>Total Questions: 210</p>
              <p>Total Time: 160 minutes</p>
              <p>Total Marks: 210</p>
              <p>Passing Marks: 105 (50%)</p>
            </div>
            
            <button className="btn btn-primary start-btn" onClick={startTest}>
              Start Mock Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="mock-test">
        <div className="test-results">
          <h2>Test Results</h2>
          <div className="score-overview">
            <div className="total-score">
              <div className="score-circle">
                <span className="score-percentage">{results.percentage}%</span>
              </div>
              <div className="score-details">
                <p>Correct: {results.correctAnswers} / {results.totalQuestions}</p>
                <p>Time Taken: {formatTime(timer)}</p>
                <p className={results.percentage >= 50 ? 'pass' : 'fail'}>
                  {results.percentage >= 50 ? 'PASSED' : 'FAILED'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="section-results">
            <h3>Section-wise Performance</h3>
            {results.sectionWise.map((section, index) => (
              <div key={index} className="section-card">
                <h4 style={{color: testSections[index].color}}>{section.name}</h4>
                <div className="section-stats">
                  <div className="stat">
                    <span>Correct: {section.correct}/{section.questions}</span>
                  </div>
                  <div className="stat">
                    <span>Percentage: {section.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="result-actions">
            <Link to="/study" className="btn btn-primary">
              Practice Weak Areas
            </Link>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              Retake Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mock-test">
      <div className="test-header">
        <h2>{testSections[currentSection].name}</h2>
        <div className="test-timer">
          <div className="timer-display">{formatTime(timer)}</div>
          <div className="section-progress">
            Section {currentSection + 1} of {testSections.length}
          </div>
        </div>
      </div>

      <div className="question-container">
        <div className="question-info">
          Question {currentQuestion + 1} of {testSections[currentSection].questions}
        </div>

        <div className="question-card">
          <h3>
            Sample Question {currentQuestion + 1}: This is a mock question for {testSections[currentSection].name}
          </h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          
          <div className="options">
            {[1, 2, 3, 4].map(option => (
              <button
                key={option}
                className={`option-btn ${answers[`${currentSection}-${currentQuestion}`] === option ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQuestion, option)}
              >
                {String.fromCharCode(64 + option)}. Option {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="test-navigation">
        <button 
          className="btn btn-secondary" 
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        
        <button 
          className="btn btn-primary" 
          onClick={nextQuestion}
        >
          {currentQuestion === testSections[currentSection].questions - 1 ? 'Next Section' : 'Next'}
        </button>
        
        {currentSection === testSections.length - 1 && 
         currentQuestion === testSections[currentSection].questions - 1 && (
          <button className="btn btn-success" onClick={finishTest}>
            Finish Test
          </button>
        )}
      </div>
    </div>
  )
}

export default MockTest
