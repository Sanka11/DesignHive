import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAv-TzSEvaFchY7Fv-TkqtqDFjGuvXMNHg",
    authDomain: "designhive-9cd14.firebaseapp.com",
    projectId: "designhive-9cd14",
    storageBucket: "designhive-9cd14.firebasestorage.app", 
    messagingSenderId: "551211572731",
    appId: "1:551211572731:web:990724b8779eaae8b03f5e",
    measurementId: "G-4JW7E6Y2NF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
