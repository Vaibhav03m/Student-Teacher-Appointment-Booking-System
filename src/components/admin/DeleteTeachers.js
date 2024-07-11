import React, { useEffect, useState } from 'react'
import { db } from '../../firebase/config'
import DeleteTeacherComponent from './DeleteTeacherComponent'
import './DeleteTeachers.css'

const DeleteTeachers = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const snapshot = await db.collection('teachers').get()
        const teachersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setTeachers(teachersData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchTeachers()
  }, []);

  const handleDelete = (teacherId) => {
    setTeachers(teachers.filter((teacher) => teacher.id !== teacherId))
  };

  return (
    <div className="delete-teachers-container">
      <h3 className="page-title">Delete Teachers</h3>
      {loading && <p>Loading...</p>}
      {error && <p className='error'>{error}</p>}
      {!loading && teachers.length === 0 && <p className="empty-container">No teachers available to delete.</p>}
      {!loading && teachers.length > 0 && (
        <div className="teacher-list">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="teacher-item">
              <DeleteTeacherComponent teacher={teacher} onDelete={() => handleDelete(teacher.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeleteTeachers;