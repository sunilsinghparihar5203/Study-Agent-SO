# SBI IT Officer Study Agent 🏦

A comprehensive AI-powered study companion designed specifically for SBI IT Officer exam preparation. This application provides personalized learning paths, progress tracking, and interactive study sessions to help you excel in your exam.

## 🎯 Features

### 📚 **Study Management**
- **Personalized Study Plans**: AI-generated daily study schedules
- **Subject-wise Learning**: Organized curriculum for all exam subjects
- **Topic Progress Tracking**: Monitor completion of individual topics and subtopics
- **Interactive Study Sessions**: Guided learning with performance analytics

### 📊 **Progress Analytics**
- **Real-time Statistics**: Track study time, questions answered, accuracy rates
- **Performance Charts**: Visual representation of subject-wise progress
- **Streak Tracking**: Maintain daily study consistency
- **Weakness Analysis**: Identify areas needing improvement

### 🎮 **Gamification**
- **Achievement System**: Unlock badges for milestones
- **Study Streaks**: Daily study rewards and motivation
- **Progress Visualization**: Beautiful progress bars and charts
- **Interactive UI**: Modern, responsive design with smooth animations

### 🔐 **Authentication & Data**
- **Google Sign-In**: Secure OAuth authentication
- **Progress Persistence**: All data saved to Firebase
- **Cross-device Sync**: Access your progress anywhere
- **User Profiles**: Personalized learning experience

## 📝 **Exam Subjects Covered**

### 🧠 **Reasoning Ability** (25% Weightage)
- **Logical Reasoning**: Syllogism, Blood Relations, Direction Sense, Coding-Decoding
- **Analytical Reasoning**: Seating Arrangement, Puzzles, Data Sufficiency

### 🔢 **Quantitative Aptitude** (25% Weightage)
- **Arithmetic**: Percentage, Profit & Loss, Simple & Compound Interest
- **Data Interpretation**: Tables, Bar Charts, Pie Charts

### 📖 **English Language** (20% Weightage)
- **Reading Comprehension**: Passage Reading, Vocabulary in Context
- **Grammar & Vocabulary**: Error Correction, Sentence Improvement, Synonyms & Antonyms

### 💻 **Computer Science** (30% Weightage)
- **Programming & Algorithms**: Data Structures, Algorithms, Time & Space Complexity
- **Database Management**: SQL, Database Design, Normalization
- **Computer Networks**: OSI & TCP/IP Models, Network Protocols, Network Security
- **Operating Systems**: Process Management, Memory Management, File Systems

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18**: Modern UI framework with hooks
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing and navigation
- **CSS3**: Custom styling with CSS variables and animations

### **Backend & Database**
- **Firebase Authentication**: Google OAuth integration
- **Firestore**: NoSQL database for real-time data storage
- **Firebase Analytics**: User behavior tracking
- **Firebase Hosting**: Production deployment

### **Development Tools**
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Git**: Version control
- **VS Code**: Recommended development environment

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager
- Google account for Firebase authentication
- Firebase project configuration

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sbi-it-officer-study-agent.git
   cd sbi-it-officer-study-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google Sign-In)
   - Enable Firestore Database
   - Copy your Firebase configuration

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 **Project Structure**

```
sbi-it-officer-study-agent/
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── Auth.jsx           # Authentication component
│   │   ├── Navbar.jsx         # Navigation bar
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── *.css              # Component styles
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
├── firebase.js                # Firebase configuration
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore file
├── package.json               # Project dependencies
└── README.md                  # This file
```

## 🔧 **Configuration**

### **Firebase Setup**

1. **Authentication Setup**
   - Go to Firebase Console → Authentication
   - Enable Google Sign-In provider
   - Add your domain to authorized domains

2. **Firestore Database Setup**
   - Go to Firebase Console → Firestore Database
   - Create a new database in test mode
   - Set up security rules (see below)

3. **Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### **Environment Variables**

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🎨 **Customization**

### **Color Scheme**
The application uses CSS variables for theming. Modify `src/index.css`:

```css
:root {
  --primary-color: #4a90e2;
  --secondary-color: #7b68ee;
  --background-primary: #1a1f2e;
  --background-secondary: #2c3e50;
  /* ... more variables */
}
```

### **Adding New Subjects**
Update `firebase.js` in the `initializeDefaultSubjects` function:

```javascript
const newSubject = {
  id: 'new-subject',
  name: 'New Subject',
  description: 'Subject description',
  order: 5,
  weightage: 10,
  topics: [
    // Add topics here
  ]
};
```

## 📱 **Responsive Design**

The application is fully responsive and works on:
- **Desktop**: 1200px+ width
- **Tablet**: 768px - 1199px width  
- **Mobile**: < 768px width

### **Breakpoints**
- Mobile: `@media (max-width: 768px)`
- Tablet: `@media (max-width: 1024px)`
- Desktop: Default styles

## 🔒 **Security Features**

- **Authentication**: Firebase Google OAuth
- **Data Validation**: Input sanitization and validation
- **Secure Storage**: Environment variables for sensitive data
- **Firestore Rules**: User-specific data access control
- **HTTPS**: Secure communication in production

## 📊 **Analytics & Tracking**

The application tracks:
- **User Authentication**: Sign-in/sign-out events
- **Study Sessions**: Time spent, topics covered
- **Progress Data**: Completion rates, accuracy
- **User Interactions**: Click events, navigation patterns

## 🚀 **Deployment**

### **Firebase Hosting**

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

### **Vercel Alternative**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Development Guidelines**
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 🐛 **Troubleshooting**

### **Common Issues**

**Firebase Import Errors**
```bash
# Ensure correct import paths
import { auth } from '../../firebase.js'  # NOT '../firebase.js'
```

**Environment Variables Not Working**
```bash
# Restart dev server after changing .env file
npm run dev
```

**Authentication Not Working**
- Check Firebase configuration
- Verify Google Sign-In is enabled
- Check domain authorization in Firebase Console

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Getting Help**

- **Issues**: Report bugs on GitHub Issues
- **Questions**: Use GitHub Discussions
- **Feature Requests**: Submit enhancement proposals

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **React Team**: For the amazing React framework
- **Firebase**: For the backend services
- **SBI**: For the exam pattern and syllabus reference
- **Open Source Community**: For inspiration and tools

## 📞 **Contact**

- **Author**: Your Name
- **Email**: your.email@example.com
- **GitHub**: https://github.com/your-username
- **LinkedIn**: https://linkedin.com/in/your-profile

## 🗺️ **Roadmap**

### **Phase 1 (Current)**
- ✅ Basic authentication system
- ✅ Study progress tracking
- ✅ Responsive dashboard
- ✅ Firebase integration

### **Phase 2 (Upcoming)**
- 🔄 Question bank system
- 🔄 Mock test functionality
- 🔄 Performance analytics
- 🔄 Study reminders

### **Phase 3 (Future)**
- 📱 Mobile application
- 🤖 AI-powered recommendations
- 👥 Study community features
- 🏆 Gamification enhancements

---

**Happy Studying! 🎓**

Made with ❤️ for SBI IT Officer aspirants
