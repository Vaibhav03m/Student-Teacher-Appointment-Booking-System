import React, { useState } from 'react';
import { useLogin } from '../../hooks/useLogin';

import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isPending, error, login } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className='login-form'>
        <h2>Login</h2>
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
        {!isPending && <button className="btn">Login</button>}
        {isPending && <button className="btn" disabled>Loading...</button>}
      </form>
      {error && <div className="login-error">{error}</div>}
      
    </div>
  );
};

export default Login;
