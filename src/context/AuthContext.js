import React, { createContext, useReducer, useEffect } from 'react';
import { projectAuth, db } from '../firebase/config';

export const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, role: action.payload.role, approved: action.payload.approved };
    case 'LOGOUT':
      return { ...state, user: null, role: null, approved: null };
      case 'AUTH_IS_READY':
        return { ...state, user: action.payload.user, role: action.payload.role, approved: action.payload.approved, authIsReady: true };
    default:
      return state;
  }
};

// AuthContextProvider component
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    role: null,
    approved: null,
    authIsReady: false,
  });

  useEffect(() => {
    const unsubscribe = projectAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = db.collection('users').doc(user.uid);
        const doc = await userRef.get();
        if (doc.exists) {
          const userData = doc.data();
          dispatch({ type: 'AUTH_IS_READY', payload: { user, role: userData.role, approved: userData.approved } });
        } else {
          dispatch({ type: 'AUTH_IS_READY', payload: { user } });
        }
      } else {
        dispatch({ type: 'AUTH_IS_READY', payload: { user: null } });
      }
      unsubscribe();
    });
  }, []);


  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
