import { useState } from 'react';
import { projectAuth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const signup = async (email, password, displayName, studentid) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await projectAuth.createUserWithEmailAndPassword(email, password);
      if (!res) {
        throw new Error('Could not complete signup');
      }

      await db.collection('users').doc(res.user.uid).set({
        displayName,
        email,
        studentid,
        role: 'student',
        approved: false
      });

      setIsPending(false);
      setError(null);

      await projectAuth.signOut();

      navigate('/login');
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return { error, isPending, signup };
};
