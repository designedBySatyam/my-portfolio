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
} catch (error) {
    console.error('ERROR Firebase initialization error:', error);
}

// Initialize Firestore with cache settings
const db = firebase.firestore();
db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code === 'failed-precondition') {
        // Multiple tabs open — persistence only works in one tab at a time
        console.warn('Firestore persistence unavailable: multiple tabs open.');
    } else if (err.code === 'unimplemented') {
        // Browser doesn't support persistence
        console.warn('Firestore persistence not supported in this browser.');
    }
});

// Initialize Auth with explicit LOCAL persistence
//   LOCAL  = survives browser restarts (best for admin)
//   SESSION = cleared when tab closes
//   NONE   = in-memory only
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
    console.warn('Auth persistence error:', err.message);
});

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