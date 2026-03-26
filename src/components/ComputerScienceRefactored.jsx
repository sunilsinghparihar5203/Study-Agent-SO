import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import toast from 'react-hot-toast'
import './ComputerScienceRefactored.css'

function ComputerScienceRefactored() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('notes')
  const [notes, setNotes] = useState([])
  const [questions, setQuestions] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)

  const computerScienceTopics = [
    {
      id: 'programming',
      name: 'Programming & Algorithms',
      topics: ['Data Structures', 'Algorithms', 'Time Complexity', 'Sorting', 'Searching', 'Dynamic Programming'],
      weightage: 30,
      color: '#667eea'
    },
    {
      id: 'databases',
      name: 'Database Management',
      topics: ['SQL', 'NoSQL', 'Normalization', 'Transactions', 'Indexing', 'Query Optimization'],
      weightage: 20,
      color: '#28a745'
    },
    {
      id: 'networking',
      name: 'Computer Networks',
      topics: ['OSI Model', 'TCP/IP', 'Network Security', 'Protocols', 'Routing', 'Subnetting'],
      weightage: 20,
      color: '#ffc107'
    },
    {
      id: 'operating_systems',
      name: 'Operating Systems',
      topics: ['Process Management', 'Memory Management', 'File Systems', 'Scheduling', 'Deadlocks', 'Linux/Windows'],
      weightage: 15,
      color: '#dc3545'
    },
    {
      id: 'software_engineering',
      name: 'Software Engineering',
      topics: ['SDLC', 'Testing', 'Version Control', 'Agile', 'Design Patterns', 'DevOps'],
      weightage: 10,
      color: '#17a2b8'
    },
    {
      id: 'web_technologies',
      name: 'Web Technologies',
      topics: ['HTML/CSS/JS', 'React/Vue', 'Node.js', 'REST APIs', 'Security', 'Performance'],
      weightage: 5,
      color: '#6f42c1'
    }
  ]

  useEffect(() => {
    if (!user) return
    loadAllData()
  }, [user])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const { getStudyNotes, getUserQuestions, getUserTestConfigurations } = await import('../../firebase.js')
      
      const [notesData, questionsData, quizzesData] = await Promise.all([
        getStudyNotes(user.uid),
        getUserQuestions(user.uid),
        getUserTestConfigurations(user.uid)
      ])

      setNotes(notesData.filter(note => note.subject === 'computer-science' || note.subjectName?.toLowerCase().includes('computer')))
      setQuestions(questionsData.filter(q => q.subject === 'computer-science' || q.subjectName?.toLowerCase().includes('computer')))
      setQuizzes(quizzesData.filter(quiz => quiz.subject === 'computer-science' || quiz.subjectName?.toLowerCase().includes('computer')))
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const renderTopicsGrid = () => {
    return (
      <div className="topics-grid">
        {computerScienceTopics.map(topic => (
          <div key={topic.id} className="topic-card">
            <div className="topic-header" style={{ backgroundColor: topic.color }}>
              <h3>{topic.name}</h3>
              <span className="weightage">{topic.weightage}%</span>
            </div>
            <div className="topic-content">
              <div className="topics-list">
                {topic.topics.map(subtopic => (
                  <div key={subtopic} className="subtopic-item">
                    <Link to={`/notes?subject=${topic.id}&topic=${subtopic}`} className="subtopic-link">
                      📝 {subtopic}
                    </Link>
                    <Link to={`/test?subject=${topic.id}&topic=${subtopic}`} className="subtopic-link">
                      📝 {subtopic}
                    </Link>
                    <Link to={`/test?subject=${topic.id}&topic=${subtopic}`} className="subtopic-link">
                      📝 {subtopic}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderNotesSection = () => {
    if (loading) {
      return <div className="loading">Loading notes...</div>
    }

    if (notes.length === 0) {
      return (
        <div className="empty-state">
          <h3>No notes yet</h3>
          <p>Start creating notes for Computer Science topics</p>
          <Link to="/notes" className="btn btn-primary">Create Notes</Link>
        </div>
      )
    }

    return (
      <div className="notes-grid">
        {notes.map(note => (
          <div key={note.id} className="note-card">
            <div className="note-header">
              <h4>{note.title}</h4>
              <span className="note-date">{new Date(note.timestamp?.toDate?.() || note.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="note-meta">
              <span className="subject-badge">{note.subjectName || 'Computer Science'}</span>
              <span className="topic-badge">{note.topic}</span>
            </div>
            <div className="note-preview">
              {note.content ? note.content.substring(0, 100) + '...' : 'No content'}
            </div>
            <div className="note-actions">
              <Link to={`/notes?edit=${note.id}`} className="btn btn-sm btn-secondary">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderQuestionsSection = () => {
    if (loading) {
      return <div className="loading">Loading questions...</div>
    }

    if (questions.length === 0) {
      return (
        <div className="empty-state">
          <h3>No questions yet</h3>
          <p>Add previous year questions for Computer Science</p>
          <Link to="/test" className="btn btn-primary">Add Questions</Link>
        </div>
      )
    }

    return (
      <div className="questions-grid">
        {questions.map(question => (
          <div key={question.id} className="question-card">
            <div className="question-header">
              <h4>{question.question}</h4>
              <span className="difficulty-badge">{question.difficulty}</span>
            </div>
            <div className="question-meta">
              <span className="subject-badge">{question.subjectName || 'Computer Science'}</span>
              <span className="topic-badge">{question.topic}</span>
            </div>
            <div className="question-options">
              {question.options.map((option, index) => (
                <div key={index} className={`option ${index === question.correctAnswer ? 'correct' : ''}`}>
                  {String.fromCharCode(65 + index)}. {option}
                </div>
              ))}
            </div>
            <div className="question-actions">
              <Link to={`/test?edit=${question.id}`} className="btn btn-sm btn-secondary">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderQuizzesSection = () => {
    if (loading) {
      return <div className="loading">Loading quizzes...</div>
    }

    if (quizzes.length === 0) {
      return (
        <div className="empty-state">
          <h3>No quizzes yet</h3>
          <p>Create practice quizzes for Computer Science</p>
          <Link to="/test" className="btn btn-primary">Create Quiz</Link>
        </div>
      )
    }

    return (
      <div className="quizzes-grid">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="quiz-card">
            <div className="quiz-header">
              <h4>{quiz.title}</h4>
              <span className="quiz-duration">{quiz.duration} min</span>
            </div>
            <div className="quiz-meta">
              <span className="questions-count">{quiz.totalQuestions} questions</span>
              <span className="difficulty-badge">{quiz.difficulty}</span>
            </div>
            {quiz.topics && quiz.topics.length > 0 && (
              <div className="quiz-topics">
                {quiz.topics.map((topic, index) => (
                  <span key={index} className="topic-tag">{topic}</span>
                ))}
              </div>
            )}
            <div className="quiz-actions">
              <button onClick={() => startQuiz(quiz)} className="btn btn-sm btn-primary">Start Quiz</button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const startQuiz = (quiz) => {
    // Navigate to test page with quiz data
    window.location.href = `/test?quiz=${quiz.id}`
  }

  return (
    <div className="computer-science-refactored">
      <div className="cs-header">
        <h2>Computer Science</h2>
        <p>Master programming, algorithms, databases, and more</p>
        <Link to="/" className="back-btn">← Back to Dashboard</Link>
      </div>

      <div className="cs-tabs">
        <button 
          className={`tab-btn ${activeTab === 'topics' ? 'active' : ''}`}
          onClick={() => setActiveTab('topics')}
        >
          📚 Topics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          📋 Previous Year Questions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          🎯 Practice Quizzes
        </button>
      </div>

      <div className="cs-content">
        {activeTab === 'topics' && renderTopicsGrid()}
        {activeTab === 'notes' && renderNotesSection()}
        {activeTab === 'questions' && renderQuestionsSection()}
        {activeTab === 'quizzes' && renderQuizzesSection()}
      </div>
    </div>
  )
}

export default ComputerScienceRefactored
