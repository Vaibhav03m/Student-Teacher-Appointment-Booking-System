import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import { db } from '../../firebase/config'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useAuthContext } from '../../hooks/useAuthContext'
import './ViewMessages.css'

Modal.setAppElement('#root') // Important for screen readers

const ViewMessages = () => {
  const { user } = useAuthContext()
  const [messagesBySender, setMessagesBySender] = useState({})
  const [error, setError] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)

  useEffect(() => {
    const updateMessages = (newMessages) => {
      setMessagesBySender(prevMessages => {
        const updatedMessages = { ...prevMessages }

        newMessages.forEach(message => {
          const senderId = message.senderId === user.uid ? message.recipientId : message.senderId
          const senderName = message.senderId === user.uid ? message.recipientName : message.senderName

          if (!updatedMessages[senderId]) {
            updatedMessages[senderId] = { senderName, messages: [] }
          }

          const existingMessageIndex = updatedMessages[senderId].messages.findIndex(m => m.id === message.id)
          if (existingMessageIndex !== -1) {
            // Replace existing message
            updatedMessages[senderId].messages[existingMessageIndex] = message
          } else {
            // Add new message
            updatedMessages[senderId].messages.push(message)
          }

          // Sort messages by timestamp
          updatedMessages[senderId].messages.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())
        });

        return updatedMessages
      });
    };

    const unsubscribeReceived = db.collection('messages')
      .where('recipientId', '==', user.uid)
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const receivedMessagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        updateMessages(receivedMessagesData)
      });

    const unsubscribeSent = db.collection('messages')
      .where('senderId', '==', user.uid)
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const sentMessagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        updateMessages(sentMessagesData)
      });

    return () => {
      unsubscribeReceived()
      unsubscribeSent()
    }
  }, [user.uid])

  const markAsRead = async (messageId) => {
    try {
      await db.collection('messages').doc(messageId).update({ read: true })
      setMessagesBySender(prevMessages => {
        const updatedMessages = { ...prevMessages }
        for (const senderId in updatedMessages) {
          const senderMessages = updatedMessages[senderId].messages.map(message => 
            message.id === messageId ? { ...message, read: true } : message
          );
          updatedMessages[senderId].messages = senderMessages
        }
        return updatedMessages
      })
    } catch (error) {
      setError('Error marking message as read')
    }
  };

  const handleMessageClick = (message) => {
    // Check if the current user is the recipient before marking as read
    if (user.uid === message.recipientId) {
      markAsRead(message.id)
    }
    setSelectedMessage(message)
  }

  const closeModal = () => {
    setSelectedMessage(null)
  }

  const truncateMessage = (content, length) => {
    if (content.length <= length) {
      return content
    }
    return content.substring(0, length) + '...'
  }

  // Sort senders based on the timestamp of their latest message
  const sortedSenders = Object.keys(messagesBySender).sort((a, b) => {
    const latestMessageA = messagesBySender[a].messages[0]
    const latestMessageB = messagesBySender[b].messages[0]
    return latestMessageB.timestamp.toDate() - latestMessageA.timestamp.toDate()
  })

  return (
    <div className="view-messages">
      <h2 className='page-title'>View Messages</h2>
      {error && <p>{error}</p>}
      {sortedSenders.length === 0 && (
        <p className="empty-container">No messages found.</p>
      )}
      <ul>
        {sortedSenders.map(senderId => (
          <li key={senderId} className="sender-group">
            <h3>Messages with {messagesBySender[senderId].senderName}</h3>
            <div className="message-list-container">
              <ul className="message-list">
                {messagesBySender[senderId].messages.map(message => (
                  <li key={message.id} className={`message-item ${message.read ? 'read' : 'unread'}`} onClick={() => handleMessageClick(message)}>
                    <p className="message-content">Message: {truncateMessage(message.content, 50)}</p>
                    <p className="message-timestamp">
                      {message.senderId === user.uid ? 'Sent' : 'Received'} {formatDistanceToNow(new Date(message.timestamp.toDate()), { addSuffix: true })}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      {selectedMessage && (
        <Modal isOpen={!!selectedMessage} onRequestClose={closeModal} className="modal" overlayClassName="modal-overlay">
          <h2>Message Details</h2>
          <p><strong>From:</strong> {selectedMessage.senderName}</p>
          <p><strong>Message:</strong> {selectedMessage.content}</p>
          <p><strong>{selectedMessage.senderId === user.uid ? 'Sent' : 'Received'}</strong> {formatDistanceToNow(new Date(selectedMessage.timestamp.toDate()), { addSuffix: true })}</p>
          <button onClick={closeModal}>Close</button>
        </Modal>
      )}
    </div>
  );
};

export default ViewMessages;
