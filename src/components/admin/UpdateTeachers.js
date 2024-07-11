import React, { useEffect, useState } from 'react'
import { db } from '../../firebase/config'
import './UpdateTeachers.css'

const UpdateTeachers = () => {
  const [teachers, setTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeachers = async () => {
      const snapshot = await db.collection('teachers').get()
      const teachersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTeachers(teachersData)
      setLoading(false)
    };
    fetchTeachers()

  }, []);

  const handleUpdate = async (teacher) => {
    setSelectedTeacher(teacher)
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      await db.collection('teachers').doc(selectedTeacher.id).update(selectedTeacher)
      alert('Teacher updated successfully!')
      
      // Update local state with the updated teacher
      setTeachers(teachers.map(teacher => {
        if (teacher.id === selectedTeacher.id) {
          return selectedTeacher
        } else {
          return teacher
        }
      }));
      
      setSelectedTeacher(null) // Reset selectedTeacher state after successful update
    } catch (error) {
      alert('Error updating teacher: ' + error.message)
    }
  };  

  return (
    <div className="update-teachers-container">
      <h3 className='page-title'>Update Teachers</h3>
      {loading && <p>Loading...</p>}
      {!loading && teachers.length === 0 && <p className="empty-container">No teachers available to update.</p>}
      {teachers.map((teacher) => (
        <div key={teacher.id} className="teacher-item">
          <span>{teacher.teacherid}</span>
          <span>{teacher.displayName}</span>
          <button className="update-button" onClick={() => handleUpdate(teacher)}>Update</button>
        </div>
      ))}
      {selectedTeacher && (
        <form onSubmit={handleFormSubmit} className="update-form">
          <label className="form-label">
            Teacher Id:
            <input
              type="text"
              value={selectedTeacher.teacherid}
              onChange={(e) => setSelectedTeacher({ ...selectedTeacher, teacherid: e.target.value })}
              className="form-input"
              required
            />
          </label>
          <label className="form-label">
            Name:
            <input
              type="text"
              value={selectedTeacher.displayName}
              onChange={(e) => setSelectedTeacher({ ...selectedTeacher, displayName: e.target.value })}
              className="form-input"
              required
            />
          </label>
          <label className="form-label">
            Department:
            <input
              type="text"
              value={selectedTeacher.department}
              onChange={(e) => setSelectedTeacher({ ...selectedTeacher, department: e.target.value })}
              className="form-input"
              required
            />
          </label>
          <label className="form-label">
            Subject:
            <input
              type="text"
              value={selectedTeacher.subject}
              onChange={(e) => setSelectedTeacher({ ...selectedTeacher, subject: e.target.value })}
              className="form-input"
              required
            />
          </label>
          <button type="submit" className="submit-button">Save</button>
        </form>
      )}
    </div>
  );
};

export default UpdateTeachers;
