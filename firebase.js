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
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

// Firebase configuration from environment variables
const cleanEnv = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
};

// Firebase configuration - NEVER hardcode credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Debug environment variables
console.log("🔍 Environment Variables Check:");
console.log(
  "VITE_FIREBASE_API_KEY exists:",
  !!import.meta.env.VITE_FIREBASE_API_KEY,
);
console.log(
  "VITE_FIREBASE_PROJECT_ID exists:",
  !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
);
console.log(
  "VITE_FIREBASE_APP_ID exists:",
  !!import.meta.env.VITE_FIREBASE_APP_ID,
);

// Test if Vite is reading .env at all
console.log("🔍 Vite Env Test:");
console.log("NODE_ENV:", import.meta.env.NODE_ENV);
console.log("MODE:", import.meta.env.MODE);
console.log(
  "All env vars:",
  Object.keys(import.meta.env).filter((key) => key.startsWith("VITE_")),
);

// Validate required Firebase config
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.projectId ||
  !firebaseConfig.appId
) {
  console.error("❌ Firebase configuration is missing required fields.");
  console.error("Available environment variables:", {
    apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: !!import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  });

  // Fallback to demo mode instead of throwing error
  console.warn(
    "⚠️ Falling back to demo mode. Please check your .env file configuration.",
  );

  // Use demo configuration
  Object.assign(firebaseConfig, {
    apiKey: "demo-api-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id",
    measurementId: "demo-measurement-id",
  });
}

console.log("🔍 Final Firebase Config:", firebaseConfig);

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

  setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error("❌ Failed to set auth persistence:", error);
  });

  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);

  // Create mock objects for demo mode
  app = null;
  analytics = null;
  db = null;
  auth = null;
}

export { app, analytics, db, auth, onAuthStateChanged };

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

// ============ SUBJECT AND TOPIC MANAGEMENT ============

// Save subject with topics to database
export const saveSubjectWithTopics = async (subjectData) => {
  try {
    const subjectsRef = collection(db, "subjects");
    const docRef = await addDoc(subjectsRef, {
      ...subjectData,
      createdAt: new Date(),
    });
    console.log("Subject saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving subject:", error);
    throw error;
  }
};

// Get all subjects with topics
export const getAllSubjects = async () => {
  try {
    const q = query(collection(db, "subjects"), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

// Get subjects and topics for a user
export const getUserSubjectsAndTopics = async (userId) => {
  try {
    const q = query(
      collection(db, "subjects"),
      where("createdBy", "==", userId),
      orderBy("name", "asc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching user subjects:", error);
    throw error;
  }
};

// Update subject
export const updateSubject = async (subjectId, subjectData) => {
  try {
    const subjectRef = doc(db, "subjects", subjectId);
    await updateDoc(subjectRef, {
      ...subjectData,
      updatedAt: new Date(),
    });
    console.log("Subject updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating subject:", error);
    throw error;
  }
};

// Delete subject (and all related questions)
export const deleteSubject = async (subjectId) => {
  try {
    // First, delete all questions related to this subject
    const questionsQuery = query(
      collection(db, "questions"),
      where("subject", "==", subjectId),
    );
    const questionsSnapshot = await getDocs(questionsQuery);

    const batch = writeBatch(db);
    questionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the subject
    const subjectRef = doc(db, "subjects", subjectId);
    batch.delete(subjectRef);

    await batch.commit();
    console.log("Subject and related questions deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting subject:", error);
    throw error;
  }
};

// Add topic to existing subject
export const addTopicToSubject = async (subjectId, topicData) => {
  try {
    const subjectRef = doc(db, "subjects", subjectId);
    const subjectDoc = await getDoc(subjectRef);

    if (!subjectDoc.exists()) {
      throw new Error("Subject not found");
    }

    const subjectData = subjectDoc.data();
    const updatedTopics = [...(subjectData.topics || []), topicData];

    await updateDoc(subjectRef, {
      topics: updatedTopics,
      updatedAt: new Date(),
    });

    console.log("Topic added successfully");
    return true;
  } catch (error) {
    console.error("Error adding topic:", error);
    throw error;
  }
};

// Update topic in subject
export const updateTopicInSubject = async (
  subjectId,
  topicIndex,
  topicData,
) => {
  try {
    const subjectRef = doc(db, "subjects", subjectId);
    const subjectDoc = await getDoc(subjectRef);

    if (!subjectDoc.exists()) {
      throw new Error("Subject not found");
    }

    const subjectData = subjectDoc.data();
    const updatedTopics = [...(subjectData.topics || [])];
    updatedTopics[topicIndex] = topicData;

    await updateDoc(subjectRef, {
      topics: updatedTopics,
      updatedAt: new Date(),
    });

    console.log("Topic updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating topic:", error);
    throw error;
  }
};

// Remove topic from subject
export const removeTopicFromSubject = async (subjectId, topicIndex) => {
  try {
    const subjectRef = doc(db, "subjects", subjectId);
    const subjectDoc = await getDoc(subjectRef);

    if (!subjectDoc.exists()) {
      throw new Error("Subject not found");
    }

    const subjectData = subjectDoc.data();
    const updatedTopics = [...(subjectData.topics || [])];
    updatedTopics.splice(topicIndex, 1);

    await updateDoc(subjectRef, {
      topics: updatedTopics,
      updatedAt: new Date(),
    });

    console.log("Topic removed successfully");
    return true;
  } catch (error) {
    console.error("Error removing topic:", error);
    throw error;
  }
};

// ============ QUESTION AND TEST MANAGEMENT ============

// Save a single question to the database
export const saveQuestion = async (questionData) => {
  try {
    if (!questionData?.createdBy) {
      throw new Error("saveQuestion: missing createdBy (userId)");
    }

    const questionsRef = collection(
      db,
      `users/${questionData.createdBy}/questions`,
    );
    const docRef = await addDoc(questionsRef, {
      ...questionData,
      createdAt: new Date(),
    });
    console.log("Question saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving question:", error);
    throw error;
  }
};

// Get questions by subject and topic (for a specific user)
export const getQuestionsBySubject = async (userId, subject, topic = null) => {
  try {
    if (!userId) {
      throw new Error("getQuestionsBySubject: missing userId");
    }

    const querySnapshot = await getDocs(
      query(
        collection(db, `users/${userId}/questions`),
        orderBy("createdAt", "desc"),
      ),
    );

    const questions = querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    return questions.filter((q) => {
      if (q.subject !== subject) return false;
      if (topic && q.topic !== topic) return false;
      return true;
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

// Get all questions for a user (created by them)
export const getUserQuestions = async (userId) => {
  try {
    if (!userId) {
      throw new Error("getUserQuestions: missing userId");
    }
    const querySnapshot = await getDocs(
      query(
        collection(db, `users/${userId}/questions`),
        orderBy("createdAt", "desc"),
      ),
    );
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error fetching user questions:", error);
    throw error;
  }
};

// Save test configuration
export const saveTestConfiguration = async (testData) => {
  try {
    if (!testData?.createdBy) {
      throw new Error("saveTestConfiguration: missing createdBy (userId)");
    }

    const testsRef = collection(
      db,
      `users/${testData.createdBy}/testConfigurations`,
    );
    const docRef = await addDoc(testsRef, {
      ...testData,
      createdAt: new Date(),
    });
    console.log("Test configuration saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving test configuration:", error);
    throw error;
  }
};

// Get test configurations for a user
export const getUserTestConfigurations = async (userId) => {
  try {
    if (!userId) {
      throw new Error("getUserTestConfigurations: missing userId");
    }
    const querySnapshot = await getDocs(
      query(
        collection(db, `users/${userId}/testConfigurations`),
        orderBy("createdAt", "desc"),
      ),
    );
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error fetching test configurations:", error);
    throw error;
  }
};

// Generate test questions using AI (Gemini integration)
export const generateTestQuestions = async (testConfig) => {
  try {
    if (!testConfig?.createdBy) {
      throw new Error("generateTestQuestions: missing createdBy (userId)");
    }

    // Import Gemini service
    const geminiService = await import("./src/services/geminiService.js").then(
      (m) => m.default,
    );

    // Generate questions using Gemini AI
    const generatedQuestions = await geminiService.generateQuestions(
      testConfig.subject,
      testConfig.topics?.[0] || "General",
      testConfig.difficulty || "medium",
      testConfig.totalQuestions || 10,
    );

    // If AI generation fails, fallback to user's question bank
    if (!generatedQuestions || generatedQuestions.length === 0) {
      console.warn("AI generation failed, using user question bank");
      return await generateTestQuestionsFromUserBank(testConfig);
    }

    return generatedQuestions;
  } catch (error) {
    console.error("Error generating test questions with AI:", error);
    // Fallback to user's question bank
    return await generateTestQuestionsFromUserBank(testConfig);
  }
};

// Fallback: generate questions from user's question bank
const generateTestQuestionsFromUserBank = async (testConfig) => {
  try {
    const allUserQuestions = await getUserQuestions(testConfig.createdBy);

    const topicSet = new Set((testConfig.topics || []).filter(Boolean));
    const filtered = allUserQuestions.filter((q) => {
      if (q.subject !== testConfig.subject) return false;
      if (topicSet.size > 0 && !topicSet.has(q.topic)) return false;
      if (testConfig.difficulty && q.difficulty !== testConfig.difficulty)
        return false;
      return true;
    });

    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(
      0,
      Math.min(testConfig.totalQuestions || 0, shuffled.length),
    );
  } catch (error) {
    console.error("Error generating test questions from user bank:", error);
    return [];
  }
};

// ============ DASHBOARD SUMMARY / AGGREGATES ============

const safeToDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  // eslint-disable-next-line no-restricted-globals
  return isNaN(parsed.getTime()) ? null : parsed;
};

const getLimitedDocs = async (collectionPath, maxDocs = 200) => {
  const snap = await getDocs(
    query(
      collection(db, collectionPath),
      orderBy("timestamp", "desc"),
      limit(maxDocs),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const getLimitedDocsByCreatedAt = async (collectionPath, maxDocs = 200) => {
  const snap = await getDocs(
    query(
      collection(db, collectionPath),
      orderBy("createdAt", "desc"),
      limit(maxDocs),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getDashboardSummary = async (userId) => {
  try {
    if (!userId) throw new Error("getDashboardSummary: missing userId");

    const [
      sessions,
      progress,
      mockTests,
      notes,
      questions,
      testConfigurations,
    ] = await Promise.all([
      getLimitedDocs(`users/${userId}/studySessions`, 200),
      getLimitedDocs(`users/${userId}/progress`, 200),
      getLimitedDocs(`users/${userId}/mockTests`, 100),
      getLimitedDocs(`users/${userId}/notes`, 200),
      getLimitedDocsByCreatedAt(`users/${userId}/questions`, 500),
      getLimitedDocsByCreatedAt(`users/${userId}/testConfigurations`, 200),
    ]);

    const totalStudyMinutes = sessions.reduce((sum, s) => {
      // some code stores duration in minutes, some in seconds; we assume minutes
      const d = typeof s.duration === "number" ? s.duration : 0;
      return sum + d;
    }, 0);

    const progressQuestions = progress.reduce(
      (sum, p) => sum + (p.questionsAnswered || 0),
      0,
    );
    const progressCorrect = progress.reduce(
      (sum, p) => sum + (p.correctAnswers || 0),
      0,
    );

    const testQuestions = mockTests.reduce(
      (sum, t) => sum + (t.totalQuestions || 0),
      0,
    );
    const testCorrectApprox = mockTests.reduce((sum, t) => {
      if (typeof t.correctCount === "number") return sum + t.correctCount;
      // if only score is present, approximate
      if (typeof t.score === "number" && typeof t.totalQuestions === "number") {
        return sum + Math.round((t.score / 100) * t.totalQuestions);
      }
      return sum;
    }, 0);

    const questionsAnswered = progressQuestions + testQuestions;
    const correctAnswers = progressCorrect + testCorrectApprox;
    const accuracy =
      questionsAnswered > 0
        ? Math.round((correctAnswers / questionsAnswered) * 100)
        : 0;

    // streak from ANY activity (session/progress/test/note)
    const activityDates = new Set();
    const addDate = (dt) => {
      const d = safeToDate(dt);
      if (!d) return;
      activityDates.add(d.toISOString().split("T")[0]);
    };
    sessions.forEach((s) => addDate(s.timestamp));
    progress.forEach((p) => addDate(p.timestamp));
    mockTests.forEach((t) => addDate(t.timestamp || t.completedAt));
    notes.forEach((n) => addDate(n.timestamp || n.createdAt));

    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (activityDates.has(key)) streak += 1;
      else if (i > 0) break;
    }

    return {
      totals: {
        studyMinutes: Math.round(totalStudyMinutes),
        questionsAnswered,
        accuracy,
        streak,
      },
      counts: {
        notes: notes.length,
        questions: questions.length,
        testsCreated: testConfigurations.length,
        testsTaken: mockTests.length,
      },
      // Per-subject aggregates
      subjects: (() => {
        const subjectMap = new Map();

        // Helper to add a subject entry
        const ensureSubject = (subjectId, subjectName) => {
          if (!subjectMap.has(subjectId)) {
            subjectMap.set(subjectId, {
              id: subjectId,
              name: subjectName || subjectId,
              notesCount: 0,
              questionsCount: 0,
              testsTakenCount: 0,
              avgScore: 0,
              totalScore: 0,
              scoreCount: 0,
            });
          }
          return subjectMap.get(subjectId);
        };

        // Process notes
        notes.forEach((note) => {
          const sub = ensureSubject(note.subject, note.subjectName);
          sub.notesCount += 1;
        });

        // Process questions
        questions.forEach((q) => {
          const sub = ensureSubject(q.subject, q.subject);
          sub.questionsCount += 1;
        });

        // Process mock tests (taken)
        mockTests.forEach((test) => {
          const sub = ensureSubject(test.subject, test.subjectName);
          sub.testsTakenCount += 1;
          if (typeof test.score === "number") {
            sub.totalScore += test.score;
            sub.scoreCount += 1;
          }
        });

        // Compute averages and progress (0-100)
        const result = Array.from(subjectMap.values()).map((s) => ({
          ...s,
          avgScore:
            s.scoreCount > 0 ? Math.round(s.totalScore / s.scoreCount) : 0,
        }));

        // Simple progress heuristic: combine notes, questions, and avgScore
        result.forEach((s) => {
          const activityScore = Math.min(
            100,
            s.notesCount * 10 + s.questionsCount * 5,
          );
          const performanceScore = s.avgScore;
          s.progress = Math.round((activityScore + performanceScore) / 2);
        });

        return result;
      })(),
      // Recent activity (last 5 items)
      recentActivity: (() => {
        const all = [
          ...sessions.map((s) => ({
            type: "session",
            title: "Study Session",
            timestamp: s.timestamp,
            data: s,
          })),
          ...progress.map((p) => ({
            type: "progress",
            title: "Progress Update",
            timestamp: p.timestamp,
            data: p,
          })),
          ...mockTests.map((t) => ({
            type: "test",
            title: "Test Taken",
            timestamp: t.timestamp || t.completedAt,
            data: t,
          })),
          ...notes.map((n) => ({
            type: "note",
            title: "Note Created",
            timestamp: n.timestamp || n.createdAt,
            data: n,
          })),
        ];
        return all
          .filter((i) => i.timestamp)
          .sort((a, b) => {
            const da = safeToDate(a.timestamp);
            const db = safeToDate(b.timestamp);
            if (!da) return 1;
            if (!db) return -1;
            return db.getTime() - da.getTime();
          })
          .slice(0, 5);
      })(),
    };
  } catch (error) {
    console.error("Error building dashboard summary:", error);
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
