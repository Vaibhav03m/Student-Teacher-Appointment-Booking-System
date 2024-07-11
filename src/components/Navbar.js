import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext'

const Navbar = () => {
  const { user, role } = useAuthContext()
  const { isPending, error, logout } = useLogout()

  return (
    <nav className='navbar'>
      <ul className="nav-left">
        {user && (
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            {role === 'admin' && (
              <li>
                <Link to="/admin-dashboard">Dashboard</Link>
              </li>
            )}
            {role === 'teacher' && (
              <li>
                <Link to="/teacher-dashboard">Dashboard</Link>
              </li>
            )}
            {role === 'student' && (
              <li>
                <Link to="/student-dashboard">Dashboard</Link>
              </li>
            )}
          </>
        )}
      </ul>
      <ul className="nav-right">
        {user ? (
          <li>
            {!isPending && <button className='btn' onClick={logout}>Logout</button>}
            {isPending && <button className='btn' disabled>Logging out...</button>}
            {error && <p>{error}</p>}
          </li>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Signup</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
