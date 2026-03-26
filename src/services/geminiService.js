// Gemini AI Service for Question Generation and Topic Content

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
    }
  }

  async generateQuestions(subject, topic, difficulty = 'medium', count = 5) {
    if (!this.apiKey) {
      return this.getMockQuestions(subject, topic, difficulty, count);
    }

    try {
      const prompt = `Generate ${count} multiple-choice questions for ${subject} - ${topic} at ${difficulty} difficulty level.
      
      Format each question as a JSON object with:
      - question: the question text
      - options: array of 4 possible answers
      - correctAnswer: index of correct answer (0-3)
      - explanation: brief explanation of the correct answer
      - difficulty: "${difficulty}"
      - subject: "${subject}"
      - topic: "${topic}"
      
      Return only a JSON array of questions, no additional text.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No response from Gemini API');
      }

      // Parse the JSON response
      const questions = JSON.parse(generatedText);
      return questions.map((q, index) => ({
        ...q,
        id: `gemini_${Date.now()}_${index}`,
        createdBy: 'ai',
        createdAt: new Date()
      }));

    } catch (error) {
      console.error('Error generating questions with Gemini:', error);
      // Fallback to mock questions
      return this.getMockQuestions(subject, topic, difficulty, count);
    }
  }

  async getTopicDescription(subject, topic) {
    if (!this.apiKey) {
      return this.getMockTopicDescription(subject, topic);
    }

    try {
      const prompt = `Provide a comprehensive description of the topic "${topic}" in ${subject}. 
      Include key concepts, importance, and practical applications. 
      Keep it under 200 words and suitable for students.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || this.getMockTopicDescription(subject, topic);

    } catch (error) {
      console.error('Error getting topic description with Gemini:', error);
      return this.getMockTopicDescription(subject, topic);
    }
  }

  async generateStudyPlan(subject, topics, duration = 30) {
    if (!this.apiKey) {
      return this.getMockStudyPlan(subject, topics, duration);
    }

    try {
      const prompt = `Create a ${duration}-day study plan for ${subject} covering these topics: ${topics.join(', ')}.
      
      Return a JSON array with this structure:
      [
        {
          "day": 1,
          "topic": "Topic Name",
          "description": "What to study",
          "timeEstimate": "2 hours",
          "keyPoints": ["Point 1", "Point 2"]
        }
      ]
      
      Keep it realistic and progressive.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No response from Gemini API');
      }

      return JSON.parse(generatedText);

    } catch (error) {
      console.error('Error generating study plan with Gemini:', error);
      return this.getMockStudyPlan(subject, topics, duration);
    }
  }

  // Mock fallback methods
  getMockQuestions(subject, topic, difficulty, count) {
    const mockQuestions = [
      {
        question: `What is the primary concept of ${topic} in ${subject}?`,
        options: [
          "Concept A",
          "Concept B", 
          "Concept C",
          "Concept D"
        ],
        correctAnswer: 0,
        explanation: `This is the fundamental concept of ${topic}`,
        difficulty,
        subject,
        topic
      },
      {
        question: `How does ${topic} apply in real-world scenarios?`,
        options: [
          "Application 1",
          "Application 2",
          "Application 3", 
          "Application 4"
        ],
        correctAnswer: 1,
        explanation: `${topic} is commonly used in various real-world applications`,
        difficulty,
        subject,
        topic
      }
    ];

    return mockQuestions.slice(0, count).map((q, index) => ({
      ...q,
      id: `mock_${Date.now()}_${index}`,
      createdBy: 'ai',
      createdAt: new Date()
    }));
  }

  getMockTopicDescription(subject, topic) {
    return `${topic} is a fundamental concept in ${subject}. It involves understanding key principles and applying them in various contexts. Mastering this topic is essential for building a strong foundation in the subject.`;
  }

  getMockStudyPlan(subject, topics, duration) {
    return topics.slice(0, Math.min(duration, topics.length)).map((topic, index) => ({
      day: index + 1,
      topic,
      description: `Study the fundamentals of ${topic}`,
      timeEstimate: "2 hours",
      keyPoints: [`Basic concepts of ${topic}`, `Practical applications`, `Common problems and solutions`]
    }));
  }
}

export default new GeminiService();
