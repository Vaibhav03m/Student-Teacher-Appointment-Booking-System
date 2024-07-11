import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import AddTeacher from './AddTeacher'
import DeleteTeachers from './DeleteTeachers'
import UpdateTeachers from './UpdateTeachers'
import ApproveStudents from './ApproveStudents'
import { useAuthContext } from '../../hooks/useAuthContext'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user, role } = useAuthContext()

  if (!user || role !== 'admin') {
    return <div>Unauthorized</div>
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav-container">
        <ul>
          <li><Link className="nav-link" to="add-teacher">Add Teacher</Link></li>
          <li><Link className="nav-link" to="update-teachers">Update Teachers</Link></li>
          <li><Link className="nav-link" to="delete-teachers">Delete Teachers</Link></li>
          <li><Link className="nav-link" to="approve-students">Approve Students</Link></li>
        </ul>
      </nav>

      <div className="admin-main-content">
        <Routes>
          <Route path="add-teacher" element={<AddTeacher />} />
          <Route path="update-teachers" element={<UpdateTeachers />} />
          <Route path="delete-teachers" element={<DeleteTeachers />} />
          <Route path="approve-students" element={<ApproveStudents />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard
