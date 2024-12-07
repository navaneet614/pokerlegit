// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getDatabase } from 'firebase/database';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLgZ66QBHtyI2DkPjnOtxursRPfmlpXqI",
  authDomain: "poker-legit.firebaseapp.com",
  databaseURL: "https://poker-legit-default-rtdb.firebaseio.com/",
  projectId: "poker-legit",
  storageBucket: "poker-legit.firebasestorage.app",
  messagingSenderId: "1054136881936",
  appId: "1:1054136881936:web:ac7cf80b5fd095f6d78b95",
  measurementId: "G-5QD6GJ5N73"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { database };