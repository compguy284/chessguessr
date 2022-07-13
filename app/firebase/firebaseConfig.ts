// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAozth9aqslPm3leuDijEhOT28_yJKriLU",
  authDomain: "chessguessr-7eb3c.firebaseapp.com",
  projectId: "chessguessr-7eb3c",
  storageBucket: "chessguessr-7eb3c.appspot.com",
  messagingSenderId: "458796929173",
  appId: "1:458796929173:web:1f2b68838af8536b0ecb9c",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);