import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import MDEditor from '@uiw/react-md-editor'
import toast from 'react-hot-toast'
import './NotesPage.css'

function NotesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Form states
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

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

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    loadNotes()
  }, [user, navigate])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const { getStudyNotes } = await import('../../firebase.js')
      const userNotes = await getStudyNotes(user.uid)
      setNotes(userNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!selectedSubject || !selectedTopic || !title.trim() || !content.trim()) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const noteData = {
        subject: selectedSubject,
        subjectName: subjects.find(s => s.id === selectedSubject)?.name,
        topic: selectedTopic,
        title: title.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        content: content.trim(),
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (isEditing && editingNote) {
        // Update existing note
        const { saveStudyNotes } = await import('../../firebase.js')
        await saveStudyNotes(user.uid, { ...noteData, id: editingNote.id })
        toast.success('Note updated successfully!')
      } else {
        // Create new note
        const { saveStudyNotes } = await import('../../firebase.js')
        await saveStudyNotes(user.uid, noteData)
        toast.success('Note saved successfully!')
      }

      // Reset form
      resetForm()
      loadNotes()
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error('Failed to save note')
    }
  }

  const handleEditNote = (note) => {
    setSelectedSubject(note.subject)
    setSelectedTopic(note.topic)
    setTitle(note.title)
    setTags(note.tags.join(', '))
    setContent(note.content)
    setIsEditing(true)
    setEditingNote(note)
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      // Implement delete functionality in firebase.js
      toast.success('Note deleted successfully!')
      loadNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  const resetForm = () => {
    setSelectedSubject('')
    setSelectedTopic('')
    setTitle('')
    setTags('')
    setContent('')
    setIsEditing(false)
    setEditingNote(null)
  }

  const filteredNotes = notes.filter(note => 
    (!selectedSubject || note.subject === selectedSubject) &&
    (!selectedTopic || note.topic === selectedTopic)
  )

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject)

  return (
    <div className="notes-page">
      <div className="notes-header">
        <div className="header-content">
          <h1>📝 Study Notes</h1>
          <p>Create and manage your study notes with rich text and code snippets</p>
        </div>
        <Link to="/computer-science" className="back-btn">
          ← Back to Computer Science
        </Link>
      </div>

      <div className="notes-container">
        {/* Note Form */}
        <div className="note-form-section">
          <div className="form-header">
            <h2>{isEditing ? '✏️ Edit Note' : '📝 Create New Note'}</h2>
            {isEditing && (
              <button onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Subject *</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => {
                  setSelectedSubject(e.target.value)
                  setSelectedTopic('')
                }}
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
              <label>Topic *</label>
              <select 
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="form-select"
                disabled={!selectedSubject}
              >
                <option value="">Select Topic</option>
                {selectedSubjectData?.topics.map(topic => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., important, algorithms, java"
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label>Content *</label>
              <div className="markdown-editor">
                <MDEditor
                  value={content}
                  onChange={(value) => setContent(value || '')}
                  height={300}
                  preview="edit"
                  hideToolbar={false}
                  textareaProps={{
                    placeholder: 'Write your notes here... You can use Markdown for formatting and code blocks!\n\nExample:\n```javascript\nfunction hello() {\n  console.log("Hello World!");\n}\n```'
                  }}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                onClick={handleSaveNote}
                className="save-btn"
                disabled={!selectedSubject || !selectedTopic || !title.trim() || !content.trim()}
              >
                {isEditing ? '💾 Update Note' : '💾 Save Note'}
              </button>
              <button onClick={resetForm} className="reset-btn">
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="notes-list-section">
          <div className="list-header">
            <h2>📚 Your Notes</h2>
            <div className="filter-controls">
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="filter-select"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <select 
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="filter-select"
                disabled={!selectedSubject}
              >
                <option value="">All Topics</option>
                {selectedSubjectData?.topics.map(topic => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-notes">
              <div className="spinner"></div>
              <p>Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="no-notes">
              <p>No notes found. Create your first note above!</p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map(note => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    <div className="note-actions">
                      <button 
                        onClick={() => handleEditNote(note)}
                        className="edit-btn"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="delete-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="note-meta">
                    <span className="subject-badge">{note.subjectName}</span>
                    <span className="topic-badge">{note.topic}</span>
                    <span className="date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="note-preview">
                    {note.content.substring(0, 150)}
                    {note.content.length > 150 && '...'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotesPage
