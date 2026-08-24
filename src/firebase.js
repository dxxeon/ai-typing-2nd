import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5UL8KHJAvkjAtOAMcf2aiedIy-cTnXRo",
  authDomain: "ai-typing-2nd.firebaseapp.com",
  projectId: "ai-typing-2nd",
  storageBucket: "ai-typing-2nd.firebasestorage.app",
  messagingSenderId: "664611527982",
  appId: "1:664611527982:web:d1c2c2db64a5be38ec6ebf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);