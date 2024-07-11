import React, { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { useAuthContext } from '../../hooks/useAuthContext'
import './SendMessage.css'

const SendMessage = () => {
  const { user } = useAuthContext()
  const [users, setUsers] = useState([])
  const [currentUserData, setCurrentUserData] = useState(null)
  const [selectedUser, setSelectedUser] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await db.collection('users').get()
        const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
        setUsers(usersData)
      } catch (error) {
        setError(error.message)
      }
    };

    const fetchCurrentUserData = async () => {
      try {
        const userDoc = await db.collection('users').doc(user.uid).get()
        if (userDoc.exists) {
          setCurrentUserData(userDoc.data())
        } else {
          setError('Current user data not found.')
        }
      } catch (error) {
        setError(error.message)
      }
    };

    fetchUsers()
    fetchCurrentUserData()
  }, [user.uid])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const recipient = users.find(u => u.uid === selectedUser)
      if (!recipient) {
        throw new Error('Recipient not found.')
      }

      await db.collection('messages').add({
        senderId: user.uid,
        senderName: currentUserData.displayName,
        recipientId: selectedUser,
        recipientName: recipient.displayName,
        content,
        timestamp: new Date(),
        read: false,
      });

      setSelectedUser('')
      setContent('')
      alert('Message sent successfully!')
    } catch (error) {
      setError(error.message)
    }
  };

  const filteredUsers = users.filter((u) => {
    if (currentUserData?.role === 'student' && u.role === 'teacher') {
      return true;
    } else if (currentUserData?.role === 'teacher' && u.role === 'student') {
      return true;
    } else if (currentUserData?.role === 'admin' && (u.role === 'teacher' || u.role === 'student')) {
      return true;
    }
    return false;
  });

  return (
    <div className="send-message">
      <h2 className='page-title'>Send Message</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Select User:
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required>
            <option value="">Select a user</option>
            {filteredUsers.map((user) => (
              <option key={user.uid} value={user.uid}>
                {user.displayName} - {user.teacherid}{user.studentid}
              </option>
            ))}
          </select>
        </label>
        <label>
          Message:
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="4" required />
        </label>
        <button type="submit">Send</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SendMessage;
