 import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
 
const firebaseConfig = {
    apiKey: "AIzaSyDLv07ED6xF7BK14m_865gKOwnDWQLa_UQ",
    authDomain: "quizgameleaderboard-3de80.firebaseapp.com",
    projectId: "quizgameleaderboard-3de80",
    storageBucket: "quizgameleaderboard-3de80.firebasestorage.app",
    messagingSenderId: "468807814484",
    appId: "1:468807814484:web:7dc6945db3d227fe590cc1"
  };

  firebase.initializeApp(firebaseConfig);
const database = firebase.database();