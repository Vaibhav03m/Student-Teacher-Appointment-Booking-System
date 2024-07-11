import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import SearchTeacher from './SearchTeacher'
import BookAppointment from './BookAppointment'
import SendMessage from '../messages/SendMessage'
import ViewMessages from '../messages/ViewMessages'
import { useAuthContext } from '../../hooks/useAuthContext'
import './StudentDashboard.css'
import ViewAppointments from './ViewAppointments'

const StudentDashboard = () => {
  const { user, role } = useAuthContext()

  if (!user || role !== 'student') {
    return <div>Unauthorized</div>
  }

  return (
    <div className="student-dashboard">
      <nav className="student-nav-container">
        <ul>
          <li><Link  className="student-nav-link" to="book-appointment">Book Appointment</Link></li>
          <li><Link  className="student-nav-link" to="search-teacher">Search Teacher</Link></li>
          <li><Link  className="student-nav-link" to="view-appointments">View Appointments</Link></li>
          <li><Link  className="student-nav-link" to="send-message">Send Message</Link></li>
          <li><Link  className="student-nav-link" to="view-message">View Messages</Link></li>
        </ul>
      </nav>

      <div className="student-main-content">
        <Routes>
          <Route path="search-teacher" element={<SearchTeacher />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="send-message" element={<SendMessage />} />
          <Route path="view-message" element={<ViewMessages />} />
          <Route path="view-appointments" element={<ViewAppointments />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
