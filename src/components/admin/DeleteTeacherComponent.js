import React from 'react'
import { db } from '../../firebase/config'
import './DeleteTeacherComponent.css'

const DeleteTeacherComponent = ({ teacher, onDelete }) => {
  const handleDelete = async () => {
    try {
      // Delete the teacher from Firestore
      await db.collection('teachers').doc(teacher.id).delete()
      await db.collection('users').doc(teacher.id).delete()

      onDelete()
    } catch (error) {
      console.error('Error deleting teacher:', error)
    }
  };

  return (
    <div className="teacher-info">
      <table>
        <tbody>
          <tr>
            <td>Name:</td>
            <td>{teacher.displayName}</td>
          </tr>
          <tr>
            <td>Teacher Id:</td>
            <td>{teacher.teacherid}</td>
          </tr>
          <tr>
            <td>Department:</td>
            <td>{teacher.department}</td>
          </tr>
          <tr>
            <td>Subject:</td>
            <td>{teacher.subject}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>{teacher.email}</td>
          </tr>
          <tr>
            <td colSpan="2">
              <button className='btn' onClick={handleDelete}>
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DeleteTeacherComponent;
