import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './ComputerScience.css'

function ComputerScience() {
  const [selectedTopic, setSelectedTopic] = useState('')
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')

  const computerScienceTopics = [
    {
      id: 'programming',
      name: 'Programming & Algorithms',
      subtopics: ['Data Structures', 'Algorithms', 'Time Complexity', 'Sorting', 'Searching', 'Dynamic Programming'],
      weightage: 30,
      color: '#667eea'
    },
    {
      id: 'databases',
      name: 'Database Management',
      subtopics: ['SQL', 'NoSQL', 'Normalization', 'Transactions', 'Indexing', 'Query Optimization'],
      weightage: 20,
      color: '#28a745'
    },
    {
      id: 'networking',
      name: 'Computer Networks',
      subtopics: ['OSI Model', 'TCP/IP', 'Network Security', 'Protocols', 'Routing', 'Subnetting'],
      weightage: 20,
      color: '#ffc107'
    },
    {
      id: 'operating_systems',
      name: 'Operating Systems',
      subtopics: ['Process Management', 'Memory Management', 'File Systems', 'Scheduling', 'Deadlocks', 'Linux/Windows'],
      weightage: 15,
      color: '#17a2b8'
    },
    {
      id: 'software_engineering',
      name: 'Software Engineering',
      subtopics: ['SDLC', 'Testing', 'Version Control', 'Agile', 'Design Patterns', 'DevOps'],
      weightage: 10,
      color: '#dc3545'
    },
    {
      id: 'web_technologies',
      name: 'Web Technologies',
      subtopics: ['HTML/CSS/JS', 'React/Vue', 'Node.js', 'REST APIs', 'Security', 'Performance'],
      weightage: 5,
      color: '#6f42c1'
    }
  ]

  const practiceQuestions = {
    programming: [
      {
        question: 'What is the time complexity of Binary Search?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct: 1,
        explanation: 'Binary Search divides the search space in half each time, resulting in O(log n) time complexity.'
      },
      {
        question: 'Which data structure uses LIFO principle?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correct: 1,
        explanation: 'Stack (Last In First Out) follows LIFO principle where the last element inserted is the first one to be removed.'
      }
    ],
    databases: [
      {
        question: 'What does ACID stand for in database transactions?',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Atomicity, Consistency, Integrity, Durability',
          'Atomicity, Consistency, Isolation, Dependency',
          'Atomicity, Concurrency, Isolation, Durability'
        ],
        correct: 0,
        explanation: 'ACID properties ensure reliable database transactions: Atomicity, Consistency, Isolation, and Durability.'
      }
    ],
    networking: [
      {
        question: 'Which layer of OSI model handles routing?',
        options: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer'],
        correct: 2,
        explanation: 'The Network Layer (Layer 3) is responsible for routing packets between networks.'
      }
    ]
  }

  useEffect(() => {
    // Load saved notes from Firebase
    loadNotes()
  }, [])

  const loadNotes = async () => {
    // Mock data - replace with Firebase call
    const savedNotes = [
      {
        id: 1,
        topic: 'programming',
        content: 'Recursion vs Iteration - when to use each approach',
        timestamp: new Date()
      }
    ]
    setNotes(savedNotes)
  }

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId)
  }

  const handleSaveNote = () => {
    if (newNote.trim() && selectedTopic) {
      const note = {
        id: Date.now(),
        topic: selectedTopic,
        content: newNote,
        timestamp: new Date()
      }
      setNotes([note, ...notes])
      // Save to Firebase
      saveNoteToFirebase(note)
      setNewNote('')
    }
  }

  const saveNoteToFirebase = async (note) => {
    // Mock Firebase save - replace with actual Firebase call
    console.log('Saving note to Firebase:', note)
  }

  const getQuestionsForTopic = (topicId) => {
    return practiceQuestions[topicId] || []
  }

  return (
    <div className="computer-science">
      <div className="cs-content">
        <div className="cs-topics-grid">
          {computerScienceTopics.map(topic => (
            <div
              key={topic.id}
              className={`topic-card ${selectedTopic === topic.id ? 'selected' : ''}`}
              onClick={() => handleTopicSelect(topic.id)}
              style={{ borderTopColor: topic.color }}
            >
              <h3 style={{ color: topic.color }}>{topic.name}</h3>
              <div className="topic-info">
                <span className="weightage">Weightage: {topic.weightage}%</span>
                <div className="subtopics">
                  {topic.subtopics.slice(0, 3).map((subtopic, index) => (
                    <span key={index} className="subtopic">{subtopic}</span>
                  ))}
                  {topic.subtopics.length > 3 && (
                    <span className="more-subtopics">+{topic.subtopics.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="study-area">
          {selectedTopic && (
            <>
              <div className="practice-section">
                <h3>Practice Questions</h3>
                <div className="questions-list">
                  {getQuestionsForTopic(selectedTopic).map((q, index) => (
                    <div key={index} className="question-card">
                      <p className="question-text">{q.question}</p>
                      <div className="options">
                        {q.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            className="option-btn"
                            onClick={() => alert(`Correct: ${q.correct === optIndex ? 'Yes' : 'No'}\n\nExplanation: ${q.explanation}`)}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="notes-section">
                <h3>Study Notes</h3>
                <div className="notes-input">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write your notes here..."
                    rows="4"
                  />
                  <button
                    className="save-note-btn"
                    onClick={handleSaveNote}
                    disabled={!newNote.trim()}
                  >
                    Save Note
                  </button>
                </div>

                <div className="saved-notes">
                  <h4>Your Notes</h4>
                  {notes
                    .filter(note => note.topic === selectedTopic)
                    .map(note => (
                      <div key={note.id} className="note-item">
                        <div className="note-content">{note.content}</div>
                        <div className="note-timestamp">
                          {new Date(note.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="cs-footer">
        <Link to="/" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default ComputerScience
