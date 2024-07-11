import React, { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { useAuthContext } from '../../hooks/useAuthContext'
import './ScheduleAppointment.css'

const ScheduleAppointment = () => {
  const { user } = useAuthContext()
  const [students, setStudents] = useState([])
  const [teacher, setTeacher] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await db.collection('students').get()
        const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setStudents(studentsData)
      } catch (error) {
        setError(error.message)
      }
    };

    const fetchTeacher = async () => {
      try {
        const teacherDoc = await db.collection('teachers').doc(user.uid).get();
        if (teacherDoc.exists) {
          setTeacher(teacherDoc.data())
        } else {
          setError('Teacher not found.')
        }
      } catch (error) {
        setError(error.message)
      }
    };

    fetchStudents()
    fetchTeacher()
  }, [user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const selectedStudentData = students.find(student => student.id === selectedStudent)
      if (!selectedStudentData) {
        throw new Error('Selected student not found.')
      }

      const selectedDateTime = new Date(`${date}T${time}:00`)
      const currentDateTime = new Date()

      if (selectedDateTime <= currentDateTime) {
        throw new Error('Appointment date and time must be in the future.')
      }

      await db.collection('appointments').add({
        studentUid: selectedStudent,
        studentId: selectedStudentData.studentid,
        studentName: selectedStudentData.displayName,
        teacherUid: user.uid,
        teacherId: teacher.teacherid,
        teacherName: teacher.displayName,
        date,
        time,
        status: 'approved',
      });

      setSelectedStudent('')
      setDate('')
      setTime('')
      alert('Appointment scheduled successfully!')
    } catch (error) {
      setError(error.message)
    }
  };

  return (
    <div className="schedule-container">
      <h2 className='page-title'>Schedule Appointment</h2>
      <form onSubmit={handleSubmit} className="appointment-form">
        <label className="form-label">
          Select Student:
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            required
            className="form-input"
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.displayName} - {student.studentid}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="form-input"
          />
        </label>
        <label className="form-label">
          Time:
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="form-input"
          />
        </label>
        <button type="submit" className="submit-button">Schedule</button>
      </form>
      {error && <p className='error'>{error}</p>}
    </div>
  );
};

export default ScheduleAppointment;
