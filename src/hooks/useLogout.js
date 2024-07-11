import { useState } from 'react'
import { projectAuth } from '../firebase/config'
import { useAuthContext } from './useAuthContext'
import { useNavigate } from 'react-router-dom'

export const useLogout = () => {
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { dispatch } = useAuthContext()
  const navigate = useNavigate()

  const logout = async () => {
    setError(null)
    setIsPending(true)

    try {
      await projectAuth.signOut()

      dispatch({ type: 'LOGOUT' })

      setIsPending(false)
      setError(null)
      navigate('/login', { replace: true })
    } 
    catch (err) {
      setError(err.message)
      setIsPending(false)
    }
  }

  return { isPending, error, logout }
}
