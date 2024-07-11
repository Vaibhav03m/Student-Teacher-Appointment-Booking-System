import React, { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import './SearchTeacher.css'

const SearchTeacher = () => {
  const [teachers, setTeachers] = useState([])
  const [nameQuery, setNameQuery] = useState('')
  const [departmentQuery, setDepartmentQuery] = useState('')
  const [subjectQuery, setSubjectQuery] = useState('')

  useEffect(() => {
    const fetchTeachers = async () => {
      const snapshot = await db.collection('teachers').get()
      const teachersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTeachers(teachersData)
    };
    fetchTeachers()
  }, []);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.displayName.toLowerCase().includes(nameQuery.toLowerCase()) &&
    teacher.department.toLowerCase().includes(departmentQuery.toLowerCase()) &&
    teacher.subject.toLowerCase().includes(subjectQuery.toLowerCase())
  );

  return (
    <div className="search-teacher">
      <h2 className='page-title'>Search Teacher</h2>
      <input
        type="text"
        value={nameQuery}
        onChange={(e) => setNameQuery(e.target.value)}
        placeholder="Search by name"
      />
      <input
        type="text"
        value={departmentQuery}
        onChange={(e) => setDepartmentQuery(e.target.value)}
        placeholder="Search by department"
      />
      <input
        type="text"
        value={subjectQuery}
        onChange={(e) => setSubjectQuery(e.target.value)}
        placeholder="Search by subject"
      />
      <ul>
        {filteredTeachers.length === 0 ? (
          <li className="empty-container">No teachers found.</li>
        ) : (
          filteredTeachers.map(teacher => (
            <li key={teacher.id}>
              <p>Name: {teacher.displayName}</p>
              <p>Email: {teacher.email}</p>
              <p>Department: {teacher.department}</p>
              <p>Subject: {teacher.subject}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default SearchTeacher;
