import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import toast from 'react-hot-toast'
import './TestPage.css'

function TestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [showTestForm, setShowTestForm] = useState(false)
  const [testMode, setTestMode] = useState(false)
  const [currentTest, setCurrentTest] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [testResults, setTestResults] = useState(null)

  // Question Form States
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'medium',
    tags: '',
    subject: '',
    topic: ''
  })

  // Test Form States
  const [testForm, setTestForm] = useState({
    title: '',
    subject: '',
    topics: [],
    duration: 30,
    totalQuestions: 10,
    difficulty: 'medium'
  })

  const subjects = [
    {
      id: 'programming',
      name: 'Programming & Algorithms',
      topics: ['Data Structures', 'Algorithms', 'Time Complexity', 'Sorting', 'Searching', 'Dynamic Programming']
    },
    {
      id: 'databases',
      name: 'Database Management',
      topics: ['SQL', 'NoSQL', 'Normalization', 'Transactions', 'Indexing', 'Query Optimization']
    },
    {
      id: 'networking',
      name: 'Computer Networks',
      topics: ['OSI Model', 'TCP/IP', 'Network Security', 'Protocols', 'Routing', 'Subnetting']
    },
    {
      id: 'operating_systems',
      name: 'Operating Systems',
      topics: ['Process Management', 'Memory Management', 'File Systems', 'Scheduling', 'Deadlocks', 'Linux/Windows']
    },
    {
      id: 'software_engineering',
      name: 'Software Engineering',
      topics: ['SDLC', 'Testing', 'Version Control', 'Agile', 'Design Patterns', 'DevOps']
    },
    {
      id: 'web_technologies',
      name: 'Web Technologies',
      topics: ['HTML/CSS/JS', 'React/Vue', 'Node.js', 'REST APIs', 'Security', 'Performance']
    }
  ]

  const [dynamicSubjects, setDynamicSubjects] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    loadTests()
    loadQuestions()
    loadDynamicSubjects()
  }, [user, navigate])

  const loadDynamicSubjects = async () => {
    try {
      const { getAllSubjects } = await import('../../firebase.js')
      const allSubjects = await getAllSubjects()
      setDynamicSubjects(allSubjects)
    } catch (error) {
      console.error('Error loading dynamic subjects:', error)
    }
  }

  // Combine static and dynamic subjects
  const allSubjects = [...subjects, ...dynamicSubjects.map(s => ({
    id: s.id,
    name: s.name,
    topics: s.topics?.map(t => t.name || t) || []
  }))]

  const loadTests = async () => {
    try {
      setLoading(true)
      const { getUserTestConfigurations } = await import('../../firebase.js')
      const testConfigurations = await getUserTestConfigurations(user.uid)
      setTests(testConfigurations)
    } catch (error) {
      console.error('Error loading tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuestions = async () => {
    try {
      const { getUserQuestions } = await import('../../firebase.js')
      const userQuestions = await getUserQuestions(user.uid)
      console.log('Loaded questions:', userQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }

  const handleSaveQuestion = async () => {
    try {
      const questionData = {
        ...questionForm,
        tags: questionForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date(),
        createdBy: user.uid
      }

      // Save to Firebase
      const { saveQuestion } = await import('../../firebase.js')
      await saveQuestion(questionData)

      toast.success('Question saved successfully!')
      resetQuestionForm()
      setShowQuestionForm(false)
      loadQuestions()
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error('Failed to save question')
    }
  }

  const handleCreateTest = async () => {
    try {
      const testData = {
        ...testForm,
        questions: [], // Will be populated based on criteria
        createdAt: new Date(),
        createdBy: user.uid
      }

      // Generate test questions using AI
      const generatedQuestions = await generateTestQuestions(testData)
      if (!generatedQuestions || generatedQuestions.length === 0) {
        toast.error('No questions found for this subject/topic. Please add questions first.')
        return
      }
      testData.questions = generatedQuestions

      // Save test configuration
      const { saveTestConfiguration } = await import('../../firebase.js')
      await saveTestConfiguration(testData)

      toast.success('Test created successfully!')
      resetTestForm()
      setShowTestForm(false)
      loadTests()
    } catch (error) {
      console.error('Error creating test:', error)
      toast.error(error?.message || 'Failed to create test')
    }
  }

  const generateTestQuestions = async (testData) => {
    try {
      // Use Firebase function to generate questions
      const { generateTestQuestions: generateQuestions } = await import('../../firebase.js')
      return await generateQuestions(testData)
    } catch (error) {
      console.error('Error generating questions:', error)
      return []
    }
  }

  const startTest = (test) => {
    setCurrentTest(test)
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setTestResults(null)
    setTestMode(true)
  }

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const newAnswers = [...userAnswers]
    newAnswers[questionIndex] = answerIndex
    setUserAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      finishTest()
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishTest = () => {
    let correctCount = 0
    const results = currentTest.questions.map((question, index) => {
      const isCorrect = userAnswers[index] === question.correctAnswer
      if (isCorrect) correctCount++
      return {
        question: question.question,
        userAnswer: userAnswers[index],
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      }
    })

    const score = (correctCount / currentTest.questions.length) * 100

    setTestResults({
      score,
      correctCount,
      totalQuestions: currentTest.questions.length,
      results,
      completedAt: new Date()
    })

    // Save test results to Firebase
    saveTestResults({
      testName: currentTest.title,
      score,
      correctCount,
      totalQuestions: currentTest.questions.length,
      userId: user.uid,
      completedAt: new Date()
    })

    setTestMode(false)
  }

  const saveTestResults = async (results) => {
    try {
      const { saveMockTestResult } = await import('../../firebase.js')
      await saveMockTestResult(user.uid, results)
    } catch (error) {
      console.error('Error saving test results:', error)
    }
  }

  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium',
      tags: '',
      subject: '',
      topic: ''
    })
  }

  const resetTestForm = () => {
    setTestForm({
      title: '',
      subject: '',
      topics: [],
      duration: 30,
      totalQuestions: 10,
      difficulty: 'medium'
    })
  }

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject)

  if (testMode && currentTest) {
    return (
      <div className="test-mode">
        <div className="test-header">
          <div className="test-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentQuestionIndex + 1) / currentTest.questions.length) * 100}%` }}
              ></div>
            </div>
            <span>Question {currentQuestionIndex + 1} of {currentTest.questions.length}</span>
          </div>
          <div className="test-timer">
            ⏱️ {currentTest.duration} min
          </div>
        </div>

        <div className="question-container">
          <div className="question-header">
            <h2>{currentTest.questions[currentQuestionIndex].question}</h2>
            <div className="question-meta">
              <span className="difficulty-badge">{currentTest.questions[currentQuestionIndex].difficulty}</span>
              <span className="topic-badge">{currentTest.questions[currentQuestionIndex].topic}</span>
            </div>
          </div>

          <div className="options-grid">
            {currentTest.questions[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            ))}
          </div>

          <div className="test-navigation">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="nav-btn"
            >
              ← Previous
            </button>
            <button
              onClick={nextQuestion}
              className="nav-btn next-btn"
            >
              {currentQuestionIndex === currentTest.questions.length - 1 ? 'Finish Test' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (testResults) {
    return (
      <div className="test-results">
        <div className="results-header">
          <h1>🎉 Test Completed!</h1>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{Math.round(testResults.score)}%</span>
            </div>
            <p>You got {testResults.correctCount} out of {testResults.totalQuestions} questions correct</p>
          </div>
        </div>

        <div className="results-details">
          <h2>Question Review</h2>
          {testResults.results.map((result, index) => (
            <div key={index} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="result-header">
                <span className="question-number">Q{index + 1}</span>
                <span className={`status-badge ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  {result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </span>
              </div>
              <p className="question-text">{result.question}</p>
              <div className="answer-comparison">
                <div className="user-answer">
                  <strong>Your Answer:</strong> {String.fromCharCode(65 + result.userAnswer)}
                </div>
                {!result.isCorrect && (
                  <div className="correct-answer">
                    <strong>Correct Answer:</strong> {String.fromCharCode(65 + result.correctAnswer)}
                  </div>
                )}
              </div>
              <div className="explanation">
                <strong>Explanation:</strong> {result.explanation}
              </div>
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button onClick={() => setTestResults(null)} className="btn btn-primary">
            📝 Take Another Test
          </button>
          <Link to="/test" className="btn btn-secondary">
            ← Back to Tests
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="test-page">
      <div className="test-header">
        <h1>📝 Subject-wise Tests</h1>
        <p>Create custom tests, manage questions, and track your performance</p>
        <div className="header-actions">
          <Link to="/subjects" className="manage-subjects-btn">
            📚 Manage Subjects
          </Link>
          <Link to="/" className="back-btn">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="test-actions">
        <button
          onClick={() => setShowQuestionForm(!showQuestionForm)}
          className="action-btn question-btn"
        >
          ➕ Add Question
        </button>
        <button
          onClick={() => setShowTestForm(!showTestForm)}
          className="action-btn test-btn"
        >
          🎯 Create Test
        </button>
      </div>

      {/* Question Form */}
      {showQuestionForm && (
        <div className="form-section">
          <h2>➕ Add New Question</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Subject *</label>
              <select
                value={questionForm.subject}
                onChange={(e) => {
                  setQuestionForm({ ...questionForm, subject: e.target.value, topic: '' })
                }}
                className="form-select"
              >
                <option value="">Select Subject</option>
                {allSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Topic *</label>
              <select
                value={questionForm.topic}
                onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                className="form-select"
                disabled={!questionForm.subject}
              >
                <option value="">Select Topic</option>
                {allSubjects.find(s => s.id === questionForm.subject)?.topics.map(topic => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={questionForm.difficulty}
                onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                className="form-select"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Correct Answer</label>
              <select
                value={questionForm.correctAnswer}
                onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: parseInt(e.target.value) })}
                className="form-select"
              >
                <option value={0}>A</option>
                <option value={1}>B</option>
                <option value={2}>C</option>
                <option value={3}>D</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Question *</label>
              <textarea
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                placeholder="Enter your question here..."
                rows={3}
                className="form-textarea"
              />
            </div>

            <div className="form-group full-width">
              <label>Options *</label>
              {questionForm.options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options]
                    newOptions[index] = e.target.value
                    setQuestionForm({ ...questionForm, options: newOptions })
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="form-input"
                />
              ))}
            </div>

            <div className="form-group full-width">
              <label>Explanation</label>
              <textarea
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                placeholder="Explain why this answer is correct..."
                rows={2}
                className="form-textarea"
              />
            </div>

            <div className="form-group full-width">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={questionForm.tags}
                onChange={(e) => setQuestionForm({ ...questionForm, tags: e.target.value })}
                placeholder="e.g., algorithms, sorting, complexity"
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button
                onClick={handleSaveQuestion}
                disabled={!questionForm.question || !questionForm.subject || !questionForm.topic || questionForm.options.some(opt => !opt.trim())}
                className="save-btn"
              >
                💾 Save Question
              </button>
              <button onClick={() => setShowQuestionForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Form */}
      {showTestForm && (
        <div className="form-section">
          <h2>🎯 Create New Test</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Test Title *</label>
              <input
                type="text"
                value={testForm.title}
                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                placeholder="e.g., Programming Fundamentals Test"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select
                value={testForm.subject}
                onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                className="form-select"
              >
                <option value="">Select Subject</option>
                {allSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={testForm.duration}
                onChange={(e) => setTestForm({ ...testForm, duration: parseInt(e.target.value) })}
                min="5"
                max="180"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Total Questions</label>
              <input
                type="number"
                value={testForm.totalQuestions}
                onChange={(e) => setTestForm({ ...testForm, totalQuestions: parseInt(e.target.value) })}
                min="5"
                max="50"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={testForm.difficulty}
                onChange={(e) => setTestForm({ ...testForm, difficulty: e.target.value })}
                className="form-select"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Topics</label>
              <select
                multiple
                value={testForm.topics}
                onChange={(e) => setTestForm({ ...testForm, topics: Array.from(e.target.selectedOptions, option => option.value) })}
                className="form-select"
                disabled={!testForm.subject}
              >
                {allSubjects.find(s => s.id === testForm.subject)?.topics.map(topic => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                onClick={handleCreateTest}
                disabled={!testForm.title || !testForm.subject}
                className="save-btn"
              >
                🚀 Create Test
              </button>
              <button onClick={() => setShowTestForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests List */}
      <div className="tests-list">
        <h2>📚 Available Tests</h2>
        {loading ? (
          <div className="loading-tests">
            <div className="spinner"></div>
            <p>Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="no-tests">
            <p>No tests available. Create your first test above!</p>
          </div>
        ) : (
          <div className="tests-grid">
            {tests.map((test, index) => (
              <div key={index} className="test-card">
                <div className="test-header">
                  <h3>{test.title || `Test ${index + 1}`}</h3>
                  <span className="difficulty-badge">{test.difficulty}</span>
                </div>

                <div className="test-meta">
                  <span className="subject-badge">{test.subject}</span>
                  <span className="duration">⏱️ {test.duration} min</span>
                  <span className="questions">📝 {test.totalQuestions} questions</span>
                </div>

                {test.topics && test.topics.length > 0 && (
                  <div className="test-topics">
                    {test.topics.map((topic, idx) => (
                      <span key={idx} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => startTest(test)}
                  className="start-test-btn"
                >
                  🚀 Start Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TestPage
