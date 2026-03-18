/**
 * ============================================
 * FIREBASE CONFIGURATION
 * ============================================
 * Make sure to replace with your actual Firebase config
 */

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyB7XKSD5xJCv7Im_1pieGTmKe22-yYv2T4",
    authDomain: "satyam-pandey27.firebaseapp.com",
    projectId: "satyam-pandey27",
    storageBucket: "satyam-pandey27.firebasestorage.app",
    messagingSenderId: "655414857184",
    appId: "1:655414857184:web:28a13556c80d45a278ef85"
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

// Initialize Auth when auth SDK is loaded on the page.
// Some public pages include only app + firestore for lighter payload.
let auth = null;
if (typeof firebase.auth === 'function') {
    auth = firebase.auth();
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
        console.warn('Auth persistence error:', err.message);
    });
} else {
    console.warn('Firebase Auth SDK not loaded on this page; auth features disabled.');
}

// Collection names
const COLLECTIONS = {
    PROJECTS: 'projects',
    CERTIFICATES: 'certificates',
    CONFIG: 'config'
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.db = db;
    window.auth = auth;
    window.COLLECTIONS = COLLECTIONS;
    window.dispatchEvent(new Event('firebase-ready'));
}
