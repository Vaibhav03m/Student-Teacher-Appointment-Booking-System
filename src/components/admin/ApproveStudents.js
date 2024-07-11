import React from 'react'
import { db } from '../../firebase/config'
import './ApproveStudents.css'

const ApproveStudents = () => {
  const [students, setStudents] = React.useState([])
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const unsubscribe = db.collection('users')
      .where('role', '==', 'student')
      .where('approved', '==', false)
      .onSnapshot(snapshot => {
        let results = []
        snapshot.docs.forEach(doc => {
          results.push({ id: doc.id, ...doc.data() })
        });
        setStudents(results)
        setError(null)
      }, err => {
        setError(err.message)
      });

    return () => unsubscribe()
  }, []);

  const handleApprove = async (studentId) => {
    try {
      const studentDoc = await db.collection('users').doc(studentId).get()
      if (studentDoc.exists) {
        const studentData = studentDoc.data()
        
        await db.collection('users').doc(studentId).update({ approved: true })

        // Add student details to 'students' collection
        await db.collection('students').doc(studentId).set({
          displayName: studentData.displayName,
          email: studentData.email,
          studentid: studentData.studentid,
          approved: true
        });

        // Fetch updated list of students after approval
        const snapshot = await db.collection('users')
          .where('role', '==', 'student')
          .where('approved', '==', false)
          .get();
        let updatedStudents = []
        snapshot.docs.forEach(doc => {
          updatedStudents.push({ id: doc.id, ...doc.data() })
        });
        setStudents(updatedStudents)
        setError(null)
      } else {
        throw new Error('Student document does not exist')
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (studentId) => {
    try {
      await db.collection('users').doc(studentId).delete()
      
      await db.collection('students').doc(studentId).delete()

      const snapshot = await db.collection('users')
        .where('role', '==', 'student')
        .where('approved', '==', false)
        .get();
      let updatedStudents = []
      snapshot.docs.forEach(doc => {
        updatedStudents.push({ id: doc.id, ...doc.data() })
      });
      setStudents(updatedStudents)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  };

  return (
    <div className="approve-students-container">
      <h2 className='page-title'>Approve Students</h2>
      {error && <p className="error-message">{error}</p>}
      {students.length === 0 ? (
        <p className="empty-container">No students to approve.</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.displayName}</td>
                <td>{student.studentid}</td>
                <td>{student.email}</td>
                <td>
                  <button className="approve-button" onClick={() => handleApprove(student.id)}>Approve</button>
                  <button className="reject-button" onClick={() => handleReject(student.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApproveStudents;
