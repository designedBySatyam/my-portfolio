/**
 * ============================================
 * FIREBASE CONFIGURATION
 * ============================================
 * Make sure to replace with your actual Firebase config
 */

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyABkncm1ImUQ1gXLphJT8WJe5ShcaIAbTU",
    authDomain: "my-fort-folio.firebaseapp.com",
    projectId: "my-fort-folio",
    storageBucket: "my-fort-folio.firebasestorage.app",
    messagingSenderId: "381839537534",
    appId: "1:381839537534:web:55830d5570860be9226f2f"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();

// Collection names
const COLLECTIONS = {
    PROJECTS: 'projects',
    CERTIFICATES: 'certificates'
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.db = db;
    window.auth = auth;
    window.COLLECTIONS = COLLECTIONS;
}