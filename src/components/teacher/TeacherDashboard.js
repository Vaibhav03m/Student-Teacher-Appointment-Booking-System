import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ScheduleAppointment from './ScheduleAppointment'
import ApproveCancelAppointment from './ApproveCancelAppointment'
import ViewMessages from '../messages/ViewMessages'
import SendMessage from '../messages/SendMessage'
import ViewAllAppointments from './ViewAllAppointments'
import ManageAvailability from './ManageAvailablility'
import { useAuthContext } from '../../hooks/useAuthContext'
import './TeacherDashboard.css'

const TeacherDashboard = () => {
  const { user, role } = useAuthContext()

  if (!user || role !== 'teacher') {
    return <div>Unauthorized</div>
  }

  return (
    <div className="teacher-dashboard">
      <nav className="teacher-nav-container">
        <ul>
          <li><Link className="nav-link" to="manage-availability">Manage Availability</Link></li>
          <li><Link className="nav-link" to="schedule-appointment">Schedule Appointment</Link></li>
          <li><Link className="nav-link" to="approve-cancel-appointment">Approve/Cancel Appointment</Link></li>
          <li><Link className="nav-link" to="view-all-appointments">View All Appointments</Link></li>
          <li><Link className="nav-link" to="send-message">Send Message</Link></li>
          <li><Link className="nav-link" to="view-messages">View Messages</Link></li>
        </ul>
      </nav>

      <div className="teacher-main-content">
        <Routes>
          <Route path="manage-availability" element={<ManageAvailability />} />
          <Route path="schedule-appointment" element={<ScheduleAppointment />} />
          <Route path="approve-cancel-appointment" element={<ApproveCancelAppointment />} />
          <Route path="send-message" element={<SendMessage />} />
          <Route path="view-messages" element={<ViewMessages />} />
          <Route path="view-all-appointments" element={<ViewAllAppointments />} />
        </Routes>
      </div>
    </div>
  );
};

export default TeacherDashboard;
