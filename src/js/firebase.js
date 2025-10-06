// src/js/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
  
  const firebaseConfig = {
    apiKey: "AIzaSyDZhD3H-2NmDEJjzRq88b5zQUf3uSRlsU4",
    authDomain: "learn-10c9b.firebaseapp.com",
    projectId: "learn-10c9b",
    storageBucket: "learn-10c9b.firebasestorage.app",
    messagingSenderId: "196813359010",
    appId: "1:196813359010:web:3b1ed5d3eb94e5b59354fb"
  };

  
  const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
