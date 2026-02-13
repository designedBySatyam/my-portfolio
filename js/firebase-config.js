/**
 * ============================================
 * FIREBASE CONFIGURATION
 * ============================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or select existing one
 * 3. Go to Project Settings > General
 * 4. Scroll down to "Your apps" and click "Web" (</> icon)
 * 5. Register your app and copy the config object
 * 6. Replace the firebaseConfig below with your credentials
 * 7. Enable Firestore Database in Firebase Console
 * 8. Enable Email/Password Authentication in Firebase Console
 */

// Your Firebase configuration
 const firebaseConfig = {
    apiKey: "AIzaSyABkncm1ImUQ1gXLphJT8WJe5ShcaIAbTU",
    authDomain: "my-fort-folio.firebaseapp.com",
    projectId: "my-fort-folio",
    storageBucket: "my-fort-folio.firebasestorage.app",
    messagingSenderId: "381839537534",
    appId: "1:381839537534:web:55830d5570860be9226f2f"
  };


// Initialize Firebase
let app, db, auth;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Firestore Collections
const COLLECTIONS = {
    PROJECTS: 'projects',
    SKILLS: 'skills',
    CERTIFICATES: 'certificates'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { app, db, auth, COLLECTIONS };
}
