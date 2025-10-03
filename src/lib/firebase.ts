import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBK1VZTkg9Zflhcs8KpBLBMqn2phNK6YTA",
  authDomain: "tech-esports.firebaseapp.com",
  databaseURL: "https://tech-esports-default-rtdb.firebaseio.com",
  projectId: "tech-esports",
  storageBucket: "tech-esports.firebasestorage.app",
  messagingSenderId: "645283066219",
  appId: "1:645283066219:web:aab2cf1f4b92032b435c2e",
  measurementId: "G-PC0GGGY9DY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);
export default app;
