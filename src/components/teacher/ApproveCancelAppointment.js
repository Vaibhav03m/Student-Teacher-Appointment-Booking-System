import React, { useState, useEffect } from "react"
import { db } from "../../firebase/config"
import { useAuthContext } from "../../hooks/useAuthContext"
import './ApproveCancelAppointment.css'

const ApproveCancelAppointment = () => {
  const { user } = useAuthContext()
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const snapshot = await db
          .collection("appointments")
          .where("teacherUid", "==", user.uid)
          .get();

        const appointmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter out appointments where date and time have passed
        const currentDate = new Date()

        const filteredAppointments = appointmentsData.filter(appointment => {
          const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
          return appointmentDateTime > currentDate
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

  const handleApprove = async (id) => {
    try {
      await db.collection("appointments").doc(id).update({ status: "approved" })

      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === id ? { ...appointment, status: "approved" } : appointment
        )
      );

      alert("Appointment approved successfully!")
    } catch (error) {
      setError(error.message)
    }
  };

  const handleCancel = async (id) => {
    try {
      await db.collection("appointments").doc(id).delete()

      setAppointments(prevAppointments =>
        prevAppointments.filter(appointment => appointment.id !== id)
      );

      alert("Appointment cancelled successfully!")
    } catch (error) {
      setError(error.message)
    }
  };

  return (
    <div className="appointment-container">
      <h2 className='page-title'>Approve/Cancel Appointments</h2>
      {error && <p className="error">{error}</p>}
      {appointments.length === 0 && <p>No upcoming appointments found.</p>}
      {appointments.length > 0 && (
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Student Id</th>
              <th>Student Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment.id} className="appointment-item">
                <td>{appointment.studentId}</td>
                <td>{appointment.studentName}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>{appointment.status}</td>
                <td>
                  {appointment.status === 'pending' && (
                    <>
                      <button className="approve" onClick={() => handleApprove(appointment.id)}>Approve</button>
                      <button className="cancel" onClick={() => handleCancel(appointment.id)}>Cancel</button>
                    </>
                  )}
                  {appointment.status === 'approved' && (
                    <button className="cancel" onClick={() => handleCancel(appointment.id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApproveCancelAppointment;
