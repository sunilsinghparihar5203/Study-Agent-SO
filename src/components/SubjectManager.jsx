import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import toast from 'react-hot-toast'
import './SubjectManager.css'

function SubjectManager() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [editingTopic, setEditingTopic] = useState({ subjectIndex: -1, topicIndex: -1 })

  // Form states
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: '',
    topics: ['']
  })

  const [topicForm, setTopicForm] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    loadSubjects()
  }, [user, navigate])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      const { getAllSubjects } = await import('../../firebase.js')
      const allSubjects = await getAllSubjects()
      setSubjects(allSubjects)
    } catch (error) {
      console.error('Error loading subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSubject = async () => {
    try {
      if (!subjectForm.name.trim()) {
        toast.error('Subject name is required')
        return
      }

      const subjectData = {
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim(),
        topics: subjectForm.topics.filter(topic => topic.trim()).map(topic => ({
          name: topic.trim(),
          description: ''
        })),
        createdBy: user.uid,
        createdAt: new Date()
      }

      if (editingSubject) {
        const { updateSubject } = await import('../../firebase.js')
        await updateSubject(editingSubject.id, subjectData)
        toast.success('Subject updated successfully!')
      } else {
        const { saveSubjectWithTopics } = await import('../../firebase.js')
        await saveSubjectWithTopics(subjectData)
        toast.success('Subject created successfully!')
      }

      resetSubjectForm()
      setShowSubjectForm(false)
      loadSubjects()
    } catch (error) {
      console.error('Error saving subject:', error)
      toast.error('Failed to save subject')
    }
  }

  const handleEditSubject = (subject) => {
    setSubjectForm({
      name: subject.name,
      description: subject.description || '',
      topics: subject.topics.map(topic => topic.name)
    })
    setEditingSubject(subject)
    setShowSubjectForm(true)
  }

  const handleDeleteSubject = async (subjectId) => {
    if (!confirm('Are you sure you want to delete this subject and all its related questions? This action cannot be undone.')) {
      return
    }

    try {
      const { deleteSubject } = await import('../../firebase.js')
      await deleteSubject(subjectId)
      toast.success('Subject deleted successfully!')
      loadSubjects()
    } catch (error) {
      console.error('Error deleting subject:', error)
      toast.error('Failed to delete subject')
    }
  }

  const handleAddTopic = (subjectIndex) => {
    const newTopicForm = { ...topicForm }
    newTopicForm.name = ''
    newTopicForm.description = ''
    setTopicForm(newTopicForm)
    setEditingTopic({ subjectIndex, topicIndex: -1 })
  }

  const handleEditTopic = (subjectIndex, topicIndex, topic) => {
    setTopicForm({
      name: topic.name,
      description: topic.description || ''
    })
    setEditingTopic({ subjectIndex, topicIndex })
  }

  const handleSaveTopic = async () => {
    try {
      if (!topicForm.name.trim()) {
        toast.error('Topic name is required')
        return
      }

      const subject = subjects[editingTopic.subjectIndex]
      const topicData = {
        name: topicForm.name.trim(),
        description: topicForm.description.trim()
      }

      if (editingTopic.topicIndex === -1) {
        // Add new topic
        const { addTopicToSubject } = await import('../../firebase.js')
        await addTopicToSubject(subject.id, topicData)
        toast.success('Topic added successfully!')
      } else {
        // Update existing topic
        const { updateTopicInSubject } = await import('../../firebase.js')
        await updateTopicInSubject(subject.id, editingTopic.topicIndex, topicData)
        toast.success('Topic updated successfully!')
      }

      resetTopicForm()
      loadSubjects()
    } catch (error) {
      console.error('Error saving topic:', error)
      toast.error('Failed to save topic')
    }
  }

  const handleDeleteTopic = async (subjectIndex, topicIndex) => {
    if (!confirm('Are you sure you want to delete this topic?')) {
      return
    }

    try {
      const subject = subjects[subjectIndex]
      const { removeTopicFromSubject } = await import('../../firebase.js')
      await removeTopicFromSubject(subject.id, topicIndex)
      toast.success('Topic deleted successfully!')
      loadSubjects()
    } catch (error) {
      console.error('Error deleting topic:', error)
      toast.error('Failed to delete topic')
    }
  }

  const resetSubjectForm = () => {
    setSubjectForm({
      name: '',
      description: '',
      topics: ['']
    })
    setEditingSubject(null)
  }

  const resetTopicForm = () => {
    setTopicForm({
      name: '',
      description: ''
    })
    setEditingTopic({ subjectIndex: -1, topicIndex: -1 })
  }

  const addTopicField = () => {
    setSubjectForm({
      ...subjectForm,
      topics: [...subjectForm.topics, '']
    })
  }

  const removeTopicField = (index) => {
    const newTopics = subjectForm.topics.filter((_, i) => i !== index)
    setSubjectForm({
      ...subjectForm,
      topics: newTopics.length > 0 ? newTopics : ['']
    })
  }

  const updateTopicField = (index, value) => {
    const newTopics = [...subjectForm.topics]
    newTopics[index] = value
    setSubjectForm({
      ...subjectForm,
      topics: newTopics
    })
  }

  return (
    <div className="subject-manager">
      <div className="manager-header">
        <div className="header-content">
          <h1>📚 Subject & Topic Manager</h1>
          <p>Create and manage subjects, topics, and organize your questions</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowSubjectForm(!showSubjectForm)}
            className="add-subject-btn"
          >
            ➕ Add Subject
          </button>
          <Link to="/test" className="back-btn">
            ← Back to Tests
          </Link>
        </div>
      </div>

      {/* Subject Form */}
      {showSubjectForm && (
        <div className="form-section">
          <h2>{editingSubject ? '✏️ Edit Subject' : '➕ Add New Subject'}</h2>
          <div className="subject-form">
            <div className="form-group">
              <label>Subject Name *</label>
              <input
                type="text"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                placeholder="e.g., Computer Science"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                placeholder="Brief description of the subject..."
                rows={3}
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label>Topics</label>
              {subjectForm.topics.map((topic, index) => (
                <div key={index} className="topic-input-group">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => updateTopicField(index, e.target.value)}
                    placeholder={`Topic ${index + 1}`}
                    className="form-input"
                  />
                  {subjectForm.topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopicField(index)}
                      className="remove-topic-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTopicField}
                className="add-topic-btn"
              >
                ➕ Add Topic
              </button>
            </div>

            <div className="form-actions">
              <button 
                onClick={handleSaveSubject}
                disabled={!subjectForm.name.trim()}
                className="save-btn"
              >
                {editingSubject ? '💾 Update Subject' : '💾 Save Subject'}
              </button>
              <button 
                onClick={() => {
                  resetSubjectForm()
                  setShowSubjectForm(false)
                }} 
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic Edit Modal */}
      {editingTopic.subjectIndex >= 0 && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingTopic.topicIndex >= 0 ? '✏️ Edit Topic' : '➕ Add Topic'}</h3>
            <div className="form-group">
              <label>Topic Name *</label>
              <input
                type="text"
                value={topicForm.name}
                onChange={(e) => setTopicForm({...topicForm, name: e.target.value})}
                placeholder="e.g., Algorithms"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={topicForm.description}
                onChange={(e) => setTopicForm({...topicForm, description: e.target.value})}
                placeholder="Brief description of the topic..."
                rows={3}
                className="form-textarea"
              />
            </div>

            <div className="form-actions">
              <button 
                onClick={handleSaveTopic}
                disabled={!topicForm.name.trim()}
                className="save-btn"
              >
                💾 Save Topic
              </button>
              <button 
                onClick={resetTopicForm}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subjects List */}
      <div className="subjects-list">
        <h2>📚 Subjects & Topics</h2>
        {loading ? (
          <div className="loading-subjects">
            <div className="spinner"></div>
            <p>Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="no-subjects">
            <p>No subjects found. Create your first subject above!</p>
          </div>
        ) : (
          <div className="subjects-grid">
            {subjects.map((subject, subjectIndex) => (
              <div key={subject.id} className="subject-card">
                <div className="subject-header">
                  <div className="subject-info">
                    <h3>{subject.name}</h3>
                    {subject.description && (
                      <p className="subject-description">{subject.description}</p>
                    )}
                  </div>
                  <div className="subject-actions">
                    <button 
                      onClick={() => handleEditSubject(subject)}
                      className="edit-btn"
                      title="Edit Subject"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="delete-btn"
                      title="Delete Subject"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="topics-section">
                  <div className="topics-header">
                    <h4>📝 Topics ({subject.topics?.length || 0})</h4>
                    <button 
                      onClick={() => handleAddTopic(subjectIndex)}
                      className="add-topic-small-btn"
                      title="Add Topic"
                    >
                      ➕
                    </button>
                  </div>

                  {subject.topics && subject.topics.length > 0 ? (
                    <div className="topics-list">
                      {subject.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="topic-item">
                          <div className="topic-info">
                            <span className="topic-name">{topic.name}</span>
                            {topic.description && (
                              <span className="topic-description">{topic.description}</span>
                            )}
                          </div>
                          <div className="topic-actions">
                            <button 
                              onClick={() => handleEditTopic(subjectIndex, topicIndex, topic)}
                              className="edit-btn"
                              title="Edit Topic"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteTopic(subjectIndex, topicIndex)}
                              className="delete-btn"
                              title="Delete Topic"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-topics">
                      <p>No topics yet. Click the + button to add topics.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SubjectManager
