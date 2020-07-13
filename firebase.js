// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCKftNwRrSinyOUJ8pecZLZX_ZQbZeqqA4",
    authDomain: "getting-started-99.firebaseapp.com",
    databaseURL: "https://getting-started-99.firebaseio.com",
    projectId: "getting-started-99",
    storageBucket: "getting-started-99.appspot.com",
    messagingSenderId: "493112502254",
    appId: "1:493112502254:web:28a214038e1719d9b250ff",
    measurementId: "G-P71JKMV3N5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({});