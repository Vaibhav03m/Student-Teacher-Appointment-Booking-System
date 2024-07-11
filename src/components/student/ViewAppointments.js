import React, { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { useAuthContext } from '../../hooks/useAuthContext'
import './ViewAppointments.css'

const ViewAppointments = () => {
  const { user } = useAuthContext()
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const snapshot = await db.collection('appointments').where('studentUid', '==', user.uid).get()
        const appointmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Filter out appointments where date and time have passed
        const currentDate = new Date();

        const filteredAppointments = appointmentsData.filter(appointment => {
          const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
          return appointmentDateTime > currentDate;
        });

        // Sort filtered appointments by date and time
        filteredAppointments.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`)
          const dateB = new Date(`${b.date}T${b.time}`)
          return dateA - dateB;
        });

        setAppointments(filteredAppointments)
      } catch (error) {
        setError(error.message)
      }
    };

    fetchAppointments()
  }, [user.uid]);

  return (
    <div className="view-appointments-container">
      <h2 className='page-title'>View Appointments</h2>
      {error && <p>{error}</p>}
      {appointments.length === 0 && <p className="empty-container">No upcoming appointments found.</p>}
      {appointments.length > 0 && (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Teacher Id</th>
              <th>Teacher Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment.id} className="appointment-row">
                <td>{appointment.teacherId}</td>
                <td>{appointment.teacherName}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>{appointment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewAppointments;
