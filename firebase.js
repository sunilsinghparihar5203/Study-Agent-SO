import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// Firebase configuration from environment variables
const cleanEnv = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
};

const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY) || "demo-api-key",
  authDomain:
    cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) ||
    "demo.firebaseapp.com",
  projectId:
    cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID) || "demo-project",
  storageBucket:
    cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) ||
    "demo.appspot.com",
  messagingSenderId:
    cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "123456789",
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID) || "demo-app-id",
  measurementId:
    cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) ||
    "demo-measurement-id",
};

// Check if Firebase is properly configured
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "demo-api-key") {
  console.warn(
    "⚠️ Firebase not configured. Using demo mode. Please set up your .env file with Firebase credentials.",
  );
} else if (!firebaseConfig.apiKey.startsWith("AIza")) {
  console.warn(
    "⚠️ Firebase apiKey does not look valid (expected to start with 'AIza'). Please re-check your .env values.",
  );
}

// Initialize Firebase with error handling
let app, analytics, db, auth;

try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  db = getFirestore(app);
  auth = getAuth(app);

  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);

  // Create mock objects for demo mode
  app = null;
  analytics = null;
  db = null;
  auth = null;
}

export { app, analytics, db, auth };

// Authentication functions
export const signUpWithEmail = async (email, password) => {
  if (!auth) {
    console.warn("Demo mode: Sign up simulated");
    return {
      uid: "demo-user-" + Date.now(),
      email: email,
      displayName: email.split("@")[0],
      photoURL: null,
    };
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  if (!auth) {
    console.warn("Demo mode: Sign in simulated");
    return {
      uid: "demo-user-" + Date.now(),
      email: email,
      displayName: email.split("@")[0],
      photoURL: null,
    };
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email) => {
  if (!auth) {
    console.warn("Demo mode: Password reset simulated");
    return true;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// ============ SUBJECTS AND TOPICS MANAGEMENT ============

// Save subjects and topics structure
export const saveSubjectsAndTopics = async (userId, subjectsData) => {
  try {
    const subjectsRef = collection(db, `users/${userId}/subjects`);
    const batch = writeBatch(db);

    subjectsData.forEach((subject) => {
      const subjectDoc = doc(subjectsRef, subject.id);
      batch.set(subjectDoc, {
        ...subject,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Save topics for each subject
      if (subject.topics && subject.topics.length > 0) {
        const topicsRef = collection(
          db,
          `users/${userId}/subjects/${subject.id}/topics`,
        );
        subject.topics.forEach((topic) => {
          const topicDoc = doc(topicsRef, topic.id);
          batch.set(topicDoc, {
            ...topic,
            subjectId: subject.id,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Save subtopics for each topic
          if (topic.subtopics && topic.subtopics.length > 0) {
            const subtopicsRef = collection(
              db,
              `users/${userId}/subjects/${subject.id}/topics/${topic.id}/subtopics`,
            );
            topic.subtopics.forEach((subtopic) => {
              const subtopicDoc = doc(subtopicsRef, subtopic.id);
              batch.set(subtopicDoc, {
                ...subtopic,
                subjectId: subject.id,
                topicId: topic.id,
                userId,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            });
          }
        });
      }
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error saving subjects and topics:", error);
    throw error;
  }
};

// Get all subjects for a user
export const getUserSubjects = async (userId) => {
  try {
    const subjectsQuery = query(
      collection(db, `users/${userId}/subjects`),
      orderBy("order", "asc"),
    );
    const querySnapshot = await getDocs(subjectsQuery);

    const subjects = [];
    for (const subjectDoc of querySnapshot.docs) {
      const subjectData = { id: subjectDoc.id, ...subjectDoc.data() };

      // Get topics for this subject
      const topicsQuery = query(
        collection(db, `users/${userId}/subjects/${subjectDoc.id}/topics`),
        orderBy("order", "asc"),
      );
      const topicsSnapshot = await getDocs(topicsQuery);

      const topics = [];
      for (const topicDoc of topicsSnapshot.docs) {
        const topicData = { id: topicDoc.id, ...topicDoc.data() };

        // Get subtopics for this topic
        const subtopicsQuery = query(
          collection(
            db,
            `users/${userId}/subjects/${subjectDoc.id}/topics/${topicDoc.id}/subtopics`,
          ),
          orderBy("order", "asc"),
        );
        const subtopicsSnapshot = await getDocs(subtopicsQuery);

        const subtopics = subtopicsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        topics.push({
          ...topicData,
          subtopics,
        });
      }

      subjects.push({
        ...subjectData,
        topics,
      });
    }

    return subjects;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

// ============ PROGRESS TRACKING ============

// Save topic/subtopic progress
export const saveTopicProgress = async (userId, progressData) => {
  try {
    const progressRef = collection(db, `users/${userId}/progress`);
    const docRef = await addDoc(progressRef, {
      ...progressData,
      timestamp: new Date(),
      userId,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving topic progress:", error);
    throw error;
  }
};

// Get progress for a specific topic/subtopic
export const getTopicProgress = async (userId, topicId) => {
  try {
    const progressQuery = query(
      collection(db, `users/${userId}/progress`),
      where("topicId", "==", topicId),
      orderBy("timestamp", "desc"),
      limit(1),
    );
    const querySnapshot = await getDocs(progressQuery);

    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching topic progress:", error);
    throw error;
  }
};

// Get all progress for a user
export const getAllProgress = async (userId) => {
  try {
    const progressQuery = query(
      collection(db, `users/${userId}/progress`),
      orderBy("timestamp", "desc"),
      limit(50),
    );
    const querySnapshot = await getDocs(progressQuery);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching all progress:", error);
    throw error;
  }
};

// Update subject/topic completion status
export const updateCompletionStatus = async (
  userId,
  itemType,
  itemId,
  isCompleted,
) => {
  try {
    let collectionPath;
    if (itemType === "subject") {
      collectionPath = `users/${userId}/subjects`;
    } else if (itemType === "topic") {
      collectionPath = `users/${userId}/subjects/${itemData.subjectId}/topics`;
    } else if (itemType === "subtopic") {
      collectionPath = `users/${userId}/subjects/${itemData.subjectId}/topics/${itemData.topicId}/subtopics`;
    }

    const docRef = doc(db, collectionPath, itemId);
    await updateDoc(docRef, {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error updating completion status:", error);
    throw error;
  }
};

// ============ STUDY SESSIONS ============

export const saveStudySession = async (userId, sessionData) => {
  try {
    const docRef = await addDoc(
      collection(db, `users/${userId}/studySessions`),
      {
        ...sessionData,
        timestamp: new Date(),
      },
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving study session:", error);
    throw error;
  }
};

export const getStudySessions = async (userId, limitCount = 10) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, `users/${userId}/studySessions`),
        orderBy("timestamp", "desc"),
        limit(limitCount),
      ),
    );
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    throw error;
  }
};

// ============ MOCK TESTS ============

export const saveMockTestResult = async (userId, testResult) => {
  try {
    await addDoc(collection(db, `users/${userId}/mockTests`), {
      ...testResult,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error saving test result:", error);
    throw error;
  }
};

export const getMockTestHistory = async (userId) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, `users/${userId}/mockTests`),
        orderBy("timestamp", "desc"),
        limit(5),
      ),
    );
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching test history:", error);
    throw error;
  }
};

// ============ NOTES ============

export const saveStudyNotes = async (userId, notes) => {
  try {
    await addDoc(collection(db, `users/${userId}/notes`), {
      ...notes,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error saving notes:", error);
    throw error;
  }
};

export const getStudyNotes = async (userId) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, `users/${userId}/notes`),
        orderBy("timestamp", "desc"),
      ),
    );
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
};

// ============ USER PREFERENCES ============

export const saveUserPreferences = async (userId, preferences) => {
  try {
    await setDoc(doc(db, `users/${userId}/preferences`, "userPrefs"), {
      ...preferences,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error saving user preferences:", error);
    throw error;
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const docRef = doc(db, `users/${userId}/preferences`, "userPrefs");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    throw error;
  }
};

// ============ ANALYTICS ============

export const getUserAnalytics = async (userId) => {
  try {
    // Get study time analytics
    const sessionsQuery = query(
      collection(db, `users/${userId}/studySessions`),
      orderBy("timestamp", "desc"),
      limit(30),
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);

    // Get progress analytics
    const progressQuery = query(
      collection(db, `users/${userId}/progress`),
      orderBy("timestamp", "desc"),
      limit(50),
    );
    const progressSnapshot = await getDocs(progressQuery);

    // Get test analytics
    const testsQuery = query(
      collection(db, `users/${userId}/mockTests`),
      orderBy("timestamp", "desc"),
      limit(10),
    );
    const testsSnapshot = await getDocs(testsQuery);

    return {
      studySessions: sessionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      progress: progressSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      mockTests: testsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    throw error;
  }
};

// Initialize default subjects and topics for new users
export const initializeDefaultSubjects = async (userId) => {
  const defaultSubjects = [
    {
      id: "reasoning",
      name: "Reasoning Ability",
      description: "Logical reasoning and analytical skills",
      order: 1,
      weightage: 25,
      isCompleted: false,
      topics: [
        {
          id: "logical-reasoning",
          name: "Logical Reasoning",
          order: 1,
          isCompleted: false,
          subtopics: [
            {
              id: "syllogism",
              name: "Syllogism",
              order: 1,
              isCompleted: false,
            },
            {
              id: "blood-relations",
              name: "Blood Relations",
              order: 2,
              isCompleted: false,
            },
            {
              id: "direction-sense",
              name: "Direction Sense",
              order: 3,
              isCompleted: false,
            },
            {
              id: "coding-decoding",
              name: "Coding-Decoding",
              order: 4,
              isCompleted: false,
            },
          ],
        },
        {
          id: "analytical-reasoning",
          name: "Analytical Reasoning",
          order: 2,
          isCompleted: false,
          subtopics: [
            {
              id: "seating-arrangement",
              name: "Seating Arrangement",
              order: 1,
              isCompleted: false,
            },
            { id: "puzzles", name: "Puzzles", order: 2, isCompleted: false },
            {
              id: "data-sufficiency",
              name: "Data Sufficiency",
              order: 3,
              isCompleted: false,
            },
          ],
        },
      ],
    },
    {
      id: "quantitative",
      name: "Quantitative Aptitude",
      description: "Mathematical and numerical ability",
      order: 2,
      weightage: 25,
      isCompleted: false,
      topics: [
        {
          id: "arithmetic",
          name: "Arithmetic",
          order: 1,
          isCompleted: false,
          subtopics: [
            {
              id: "percentage",
              name: "Percentage",
              order: 1,
              isCompleted: false,
            },
            {
              id: "profit-loss",
              name: "Profit & Loss",
              order: 2,
              isCompleted: false,
            },
            {
              id: "simple-interest",
              name: "Simple Interest",
              order: 3,
              isCompleted: false,
            },
            {
              id: "compound-interest",
              name: "Compound Interest",
              order: 4,
              isCompleted: false,
            },
          ],
        },
        {
          id: "data-interpretation",
          name: "Data Interpretation",
          order: 2,
          isCompleted: false,
          subtopics: [
            { id: "tables", name: "Tables", order: 1, isCompleted: false },
            {
              id: "bar-charts",
              name: "Bar Charts",
              order: 2,
              isCompleted: false,
            },
            {
              id: "pie-charts",
              name: "Pie Charts",
              order: 3,
              isCompleted: false,
            },
          ],
        },
      ],
    },
    {
      id: "english",
      name: "English Language",
      description: "English language and comprehension",
      order: 3,
      weightage: 20,
      isCompleted: false,
      topics: [
        {
          id: "comprehension",
          name: "Reading Comprehension",
          order: 1,
          isCompleted: false,
          subtopics: [
            {
              id: "passage-reading",
              name: "Passage Reading",
              order: 1,
              isCompleted: false,
            },
            {
              id: "vocabulary-context",
              name: "Vocabulary in Context",
              order: 2,
              isCompleted: false,
            },
          ],
        },
        {
          id: "grammar",
          name: "Grammar & Vocabulary",
          order: 2,
          isCompleted: false,
          subtopics: [
            {
              id: "error-correction",
              name: "Error Correction",
              order: 1,
              isCompleted: false,
            },
            {
              id: "sentence-improvement",
              name: "Sentence Improvement",
              order: 2,
              isCompleted: false,
            },
            {
              id: "synonyms-antonyms",
              name: "Synonyms & Antonyms",
              order: 3,
              isCompleted: false,
            },
          ],
        },
      ],
    },
    {
      id: "computer-science",
      name: "Computer Science",
      description: "Computer science and IT knowledge",
      order: 4,
      weightage: 30,
      isCompleted: false,
      topics: [
        {
          id: "programming",
          name: "Programming & Algorithms",
          order: 1,
          isCompleted: false,
          subtopics: [
            {
              id: "data-structures",
              name: "Data Structures",
              order: 1,
              isCompleted: false,
            },
            {
              id: "algorithms",
              name: "Algorithms",
              order: 2,
              isCompleted: false,
            },
            {
              id: "complexity",
              name: "Time & Space Complexity",
              order: 3,
              isCompleted: false,
            },
          ],
        },
        {
          id: "databases",
          name: "Database Management",
          order: 2,
          isCompleted: false,
          subtopics: [
            { id: "sql", name: "SQL", order: 1, isCompleted: false },
            {
              id: "database-design",
              name: "Database Design",
              order: 2,
              isCompleted: false,
            },
            {
              id: "normalization",
              name: "Normalization",
              order: 3,
              isCompleted: false,
            },
          ],
        },
        {
          id: "networking",
          name: "Computer Networks",
          order: 3,
          isCompleted: false,
          subtopics: [
            {
              id: "os-models",
              name: "OSI & TCP/IP Models",
              order: 1,
              isCompleted: false,
            },
            {
              id: "protocols",
              name: "Network Protocols",
              order: 2,
              isCompleted: false,
            },
            {
              id: "security",
              name: "Network Security",
              order: 3,
              isCompleted: false,
            },
          ],
        },
        {
          id: "operating-systems",
          name: "Operating Systems",
          order: 4,
          isCompleted: false,
          subtopics: [
            {
              id: "process-management",
              name: "Process Management",
              order: 1,
              isCompleted: false,
            },
            {
              id: "memory-management",
              name: "Memory Management",
              order: 2,
              isCompleted: false,
            },
            {
              id: "file-systems",
              name: "File Systems",
              order: 3,
              isCompleted: false,
            },
          ],
        },
      ],
    },
  ];

  await saveSubjectsAndTopics(userId, defaultSubjects);
  return defaultSubjects;
};
