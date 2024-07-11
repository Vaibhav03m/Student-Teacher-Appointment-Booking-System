import React, { useState } from 'react'
import { useSignup } from '../../hooks/useSignup'

import './Signup.css';

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [studentid, setStudentid] = useState('')
  const { signup, error, isPending } = useSignup()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await signup(email, password, displayName, studentid)
  }

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>Signup</h2>
      <h6>(Only for students)</h6>
      <label>
        <span>Name:</span>
        <input 
          type="text" 
          required 
          value={displayName} 
          onChange={(e) => setDisplayName(e.target.value)} 
        />
      </label>
      <label>
        <span>Student ID:</span>
        <input 
          type="text" 
          required 
          value={studentid} 
          onChange={(e) => setStudentid(e.target.value)} 
        />
      </label>
      <label>
        <span>Email:</span>
        <input 
          type="email" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </label>
      <label>
        <span>Password:</span>
        <input 
          type="password" 
          required 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </label>
      {!isPending && <button className="btn">Signup</button>}
      {isPending && <button className="btn" disabled>Loading...</button>}
      {error && <div className="error">{error}</div>}
    </form>
  )
}

export default Signup
