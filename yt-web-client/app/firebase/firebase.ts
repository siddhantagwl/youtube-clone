// config and lib code , not a page as per next JS structure.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged,User } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ,
  authDomain: "yt-clone-8285c.firebaseapp.com",
  projectId: "yt-clone-8285c",


  appId: "1:410145935945:web:44634b2c7a56d25b53a598",

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth(app);

export const functions = getFunctions();

// sign in with Google pop up
export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  const result = signInWithPopup(auth, provider);
  return result;
}

//sign out
export const signOut = () => {
  return auth.signOut();
};

// trigger a callback when user auth state changes
export const onAuthStateChangedHelper = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};