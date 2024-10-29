import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAuth, db } from '../firebase/config';
import { useAuthContext } from './useAuthContext';

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const login = async (email, password) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await projectAuth.signInWithEmailAndPassword(email, password);

      if (!res) {
        throw new Error('Could not complete login');
      }

      // Fetch additional user data (role and approved) from Firestore
      const userRef = db.collection('users').doc(res.user.uid);
      const doc = await userRef.get();

      if (doc.exists) {
        const userData = doc.data();
        if (userData.role === 'student' && !userData.approved) {
          await projectAuth.signOut()
          throw new Error('Your account is not approved yet. Please contact the admin.');
        }
        dispatch({ type: 'LOGIN', payload: { user: res.user, role: userData.role, approved: userData.approved } });

        setIsPending(false);
        setError(null);

        switch (userData.role) {
          case 'admin':
            navigate('/', { replace: true });
            break;
          case 'teacher':
            navigate('/', { replace: true });
            break;
          case 'student':
            navigate('/', { replace: true });
            break;
          
          default:
            throw new Error('Unknown role');
        }

      } else {
        await projectAuth.signOut()
        throw new Error('User data not found.');
      }

    } catch (err) {

      console.log(err)

      if (err.message.includes('approved')) {
        setError(err.message)
      } else if (err.message.includes('INVALID_LOGIN_CREDENTIALS')) {
        setError('Invalid credentials. Please check your email and password.');
      } else if (err.message.includes('user record')) {
        setError('User not found. Please check your email.');
      } else {
        setError('An error occurred. Please try again.');
      }

      setIsPending(false);
    }
  };

  return { isPending, error, login };
};
