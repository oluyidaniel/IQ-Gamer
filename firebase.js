// // firebase.js (place in same folder as your HTML files)

// Load Firebase app + database compat libraries
const firebaseConfig = {
  apiKey: "AIzaSyDLv07ED6xF7BK14m_865gKOwnDWQLa_UQ",
  authDomain: "quizgameleaderboard-3de80.firebaseapp.com",
  databaseURL: "https://quizgameleaderboard-3de80-default-rtdb.firebaseio.com",
  projectId: "quizgameleaderboard-3de80",
  storageBucket: "quizgameleaderboard-3de80.appspot.com",
  messagingSenderId: "468807814484",
  appId: "1:468807814484:web:7dc6945db3d227fe590cc1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make `database` globally accessible
const database = firebase.database();
