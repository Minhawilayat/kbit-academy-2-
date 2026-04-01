import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Default placeholder config
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "kbit-academy.firebaseapp.com",
  projectId: "kbit-academy",
  storageBucket: "kbit-academy.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

let config = firebaseConfig;

// We use a dynamic approach or check if the file exists via a safer way in this environment
// For this specific platform, we can try to require it if it's available or just use the default
// Since the provisioning failed, the file likely doesn't exist yet.

const app = initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth(app);
