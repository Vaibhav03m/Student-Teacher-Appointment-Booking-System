import React, { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { useAuthContext } from '../../hooks/useAuthContext'
import './BookAppointment.css'

const BookAppointment = () => {
  const { user } = useAuthContext()
  const [teachers, setTeachers] = useState([])
  const [student, setStudent] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const snapshot = await db.collection('teachers').get()
        const teachersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setTeachers(teachersData)
      } catch (error) {
        setError(error.message)
      }
    };

    const fetchStudent = async () => {
      try {
        const studentDoc = await db.collection('students').doc(user.uid).get()
        if (studentDoc.exists) {
          setStudent(studentDoc.data())
        } else {
          setError('Student not found.')
        }
      } catch (error) {
        setError(error.message)
      }
    };

    fetchTeachers()
    fetchStudent()
  }, [user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const selectedTeacherData = teachers.find(teacher => teacher.id === selectedTeacher)

      if (!selectedTeacherData) {
        throw new Error('Selected teacher not found.')
      }

      if (!student) {
        throw new Error('Student information not available.')
      }

      // Validate date and time
      const selectedDateTime = new Date(`${date}T${time}:00`)
      const currentDateTime = new Date()

      if (selectedDateTime <= currentDateTime) {
        throw new Error('Appointment date and time must be in the future.')
      }

      await db.collection('appointments').add({
        studentUid: user.uid,
        studentId: student.studentid,
        studentName: student.displayName,
        teacherUid: selectedTeacher,
        teacherId: selectedTeacherData.teacherid,
        teacherName: selectedTeacherData.displayName,
        date,
        time,
        status: 'pending',
      });

      setSelectedTeacher('')
      setDate('')
      setTime('')
      alert('Appointment requested successfully!')
    } catch (error) {
      setError(error.message)
    }
  };

  return (
    <div className="book-appointment">
      <h2 className='page-title'>Book Appointment</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Select Teacher:
          <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} required>
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.displayName} - {teacher.teacherid}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Time:
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>
        <button type="submit">Book</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default BookAppointment;
