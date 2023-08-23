// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeu9nn9L22bmnVjUKt-RTFAUNe5k5cXIc",
  authDomain: "shapeup-63628.firebaseapp.com",
  projectId: "shapeup-63628",
  storageBucket: "shapeup-63628.appspot.com",
  messagingSenderId: "761309079749",
  appId: "1:761309079749:web:9f3b844da5cc264613a8ac",
  measurementId: "G-E6EZJR89R9"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);