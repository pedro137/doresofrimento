import { initializeApp } from "firebase/app";
import {getDatabase} from"firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyBSgEQnOxifmI9CzhcWC6H2cFNCD3Y0H0k",
  authDomain: "fb-crud-9cd7b.firebaseapp.com",
  projectId: "fb-crud-9cd7b",
  storageBucket: "fb-crud-9cd7b.appspot.com",
  messagingSenderId: "988885590426",
  appId: "1:988885590426:web:1cbf35094cb511d01bda23"
};


const app = initializeApp(firebaseConfig);

export const db = getDatabase(app)