import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { db } from '../firebase/config'
import './Home.css'

const Home = () => {
  const { user } = useAuthContext()
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = db.collection('users').doc(user.uid)
        const doc = await userRef.get()
        if (doc.exists) {
          setUserData(doc.data())
        } else {
          setError('Could not fetch data')
        }
      } catch (error) {
        setError('Error fetcing user data.')
      }
    };

    if (user) {
      fetchUserData()
    }
  }, [user]);

  return (
    <div className="home-container">
      {error && <p className='error'>{error}</p>}
      {!error && (
        <div className="home-content">
          <h2>Welcome, {userData && userData.displayName}!</h2>
          <p>Welcome to our appointment scheduling system.</p>
          <p>Our platform is designed to streamline the scheduling process for both students and teachers.</p>
          <p>Teachers can manage their schedules, approve appointments, and communicate effectively with students.</p>
          <p>Students can easily request appointments, track their schedules, and receive updates.</p>
          <p>With our user-friendly interface, scheduling appointments has never been easier.</p>
          <p>Whether you're a teacher or a student, our goal is to provide a seamless experience that enhances communication and organization.</p>
          <p>Start managing your appointments today and enjoy a more efficient scheduling experience!</p>
        </div>
      )}
    </div>
  );
};

export default Home;
