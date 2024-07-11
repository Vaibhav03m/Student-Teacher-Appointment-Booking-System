import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAMNvIqnJRzmME_NMIiEMlDYEQmKdgHE9k",
  authDomain: "appointmentbookingsystem-520b8.firebaseapp.com",
  projectId: "appointmentbookingsystem-520b8",
  storageBucket: "appointmentbookingsystem-520b8.appspot.com",
  messagingSenderId: "1413967356",
  appId: "1:1413967356:web:450ee99c3ea4e87b7b5679",
};

firebase.initializeApp(firebaseConfig)

const db = firebase.firestore()
const projectAuth = firebase.auth()

const timestamp = firebase.firestore.Timestamp

export { db, projectAuth, timestamp }