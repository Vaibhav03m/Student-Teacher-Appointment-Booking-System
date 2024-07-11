import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Navbar from './components/Navbar';
import { useAuthContext } from './hooks/useAuthContext';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import Home from './components/Home';

function App() {
  const { user, role, authIsReady, approved } = useAuthContext()

  const isAdmin = user && role === 'admin';
  const isTeacher = user && role === 'teacher';
  const isStudent = user && role === 'student' && approved;

  return (
    <div className="App">
      {authIsReady && (
        <BrowserRouter>
        <Navbar />
        <Routes>
          {user && approved && <Route path='/' element={<Home />} />}
          {!user && !approved && <Route path='/login' element={<Login />} />}
          {!user && <Route path='/signup' element={<Signup />} />}

          {isAdmin && <Route path='/admin-dashboard/*' element={<AdminDashboard />} />}
          {isTeacher && <Route path='/teacher-dashboard/*' element={<TeacherDashboard />} />}
          {isStudent && <Route path='/student-dashboard/*' element={<StudentDashboard />} />}

          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
      )}
      
    </div>
  );
}

export default App;