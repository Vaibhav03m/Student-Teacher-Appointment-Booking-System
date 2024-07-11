import React, { useState } from 'react'
import { db, projectAuth } from '../../firebase/config'
import './AddTeacher.css'

const AddTeacher = () => {
  const [displayName, setDisplayName] = useState('')
  const [teacherid, setTeacherid] = useState('')
  const [department, setDepartment] = useState('')
  const [subject, setSubject] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Save the current admin credentials before creating the teacher
    const currentUser = projectAuth.currentUser
    const adminEmail = currentUser.email
    const adminPassword = prompt("Please re-enter your password to confirm:")

    if (!adminPassword) {
      alert('Admin password is required to add a teacher.')
      return;
    }

    try {
      const authUser = await projectAuth.createUserWithEmailAndPassword(email, password)

      const teacherData = {
        displayName,
        teacherid,
        email,
        role: 'teacher',
        approved: true,
      };

      await db.collection('users').doc(authUser.user.uid).set(teacherData)
      await db.collection('teachers').doc(authUser.user.uid).set({
        ...teacherData,
        department,
        subject,
      })

      // Sign the admin back in
      await projectAuth.signInWithEmailAndPassword(adminEmail, adminPassword)

      setDisplayName('')
      setTeacherid('')
      setDepartment('')
      setSubject('')
      setEmail('')
      setPassword('')

      alert('Teacher added successfully!')
    } catch (error) {
      alert('Error adding teacher: ' + error.message)
    }
  };

  return (
    <div className="add-teacher-container">
      <h3 className="page-title">Add Teacher</h3>
      <form className="add-teacher-form" onSubmit={handleSubmit}>
        <label className="form-label">
          Name:
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="form-input"
            required
          />
        </label>
        <label className="form-label">
          Teacher Id
          <input
            type="text"
            value={teacherid}
            onChange={(e) => setTeacherid(e.target.value)}
            className="form-input"
            required
          />
        </label>
        <label className="form-label">
          Department:
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="form-input"
            required
          />
        </label>
        <label className="form-label">
          Subject:
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-input"
            required
          />
        </label>
        <label className="form-label">
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </label>
        <label className="form-label">
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </label>
        <button type="submit" className="form-button">Add Teacher</button>
      </form>
    </div>
  );
};

export default AddTeacher;
