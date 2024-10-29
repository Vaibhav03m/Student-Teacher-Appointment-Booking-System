import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./ScheduleAppointment.css";

const ScheduleAppointment = () => {
  const { user } = useAuthContext();
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [unavailableSlots, setUnavailableSlots] = useState([]); // State for unavailable slots
  const [date, setDate] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [error, setError] = useState(null);
  const timeSlots = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await db.collection('students').get();
        const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(studentsData);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchTeacher = async () => {
      try {
        const teacherDoc = await db.collection("teachers").doc(user.uid).get();
        if (teacherDoc.exists) {
          setTeacher(teacherDoc.data());
        } else {
          setError("Teacher not found.");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchStudents();
    fetchTeacher();
  }, [user.uid]);

  const fetchUnavailableSlots = async (selectedDate) => {
    try {
      const snapshot = await db
        .collection("unavailableSlots")
        .where("teacherUid", "==", user.uid)
        .where("date", "==", selectedDate)
        .get();
      const unavailableData = snapshot.docs.map((doc) => doc.data());
      setUnavailableSlots(unavailableData.map((slot) => slot.time)); // Store only the time strings
    } catch (error) {
      setError("Error fetching unavailable slots.");
    }
  };

  const fetchAppointments = async (selectedDate) => {
    try {
      const snapshot = await db
        .collection("appointments")
        .where("teacherUid", "==", user.uid)
        .where("date", "==", selectedDate)
        .get();

      const appointmentsData = snapshot.docs.map((doc) => doc.data());
      setAppointments(appointmentsData);
    } catch (error) {
      setError("Error fetching appointments.");
    }
  };

  useEffect(() => {
    if (date) {
      fetchAppointments(date);
      fetchUnavailableSlots(date); // Fetch unavailable slots when date changes
    }
  }, [date]);

  const isSlotBooked = (time) => {
    return appointments.some((appointment) => appointment.time === time);
  };

  const isSlotUnavailable = (time) => {
    return unavailableSlots.includes(time);
  };

  const handleSchedule = async (timeSlot) => {
    const today = new Date();
    const selectedDate = new Date(date);

    // Ensure the selected date is not today or a past date
    if (selectedDate <= today.setHours(0, 0, 0, 0)) {
      setError("You can only schedule appointments from tomorrow onward.");
      return;
    }

    if (!selectedStudent || !date) {
      setError("Please select a student and date before scheduling.");
      return;
    }

    try {
      const selectedStudentData = students.find(
        (student) => student.id === selectedStudent
      );
      if (!selectedStudentData) {
        throw new Error("Selected student not found.");
      }

      await db.collection("appointments").add({
        studentUid: selectedStudent,
        studentId: selectedStudentData.studentid,
        studentName: selectedStudentData.displayName,
        teacherUid: user.uid,
        teacherId: teacher.teacherid,
        teacherName: teacher.displayName,
        date,
        time: timeSlot,
        status: "approved",
      });

      fetchAppointments(date); // Refresh appointments after scheduling
      alert("Appointment scheduled successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const minDate = tomorrowDate.toISOString().split("T")[0];

  return (
    <div className="schedule-container">
      <h2 className="page-title">Schedule Appointment</h2>
      <form className="appointment-form">
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
            min={minDate} // Restrict the selection to tomorrow onward
            onChange={(e) => setDate(e.target.value)}
            required
            className="form-input"
          />
        </label>
      </form>
      {error && <p className="error">{error}</p>}

      {date && (
        <div className="time-slots">
          <table className="time-slot-table">
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot}>
                  <td>{slot}</td>
                  <td>
                    {isSlotBooked(slot)
                      ? "Booked"
                      : isSlotUnavailable(slot)
                      ? "Unavailable"
                      : "Free"}
                  </td>
                  <td>
                    {isSlotBooked(slot) ? (
                      <button
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          padding: "10px 15px",
                          cursor: "not-allowed",
                          opacity: 0.6,
                        }}
                        disabled
                      >
                        Booked
                      </button>
                    ) : isSlotUnavailable(slot) ? (
                      <button
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          padding: "10px 15px",
                          cursor: "not-allowed",
                          opacity: 0.6,
                        }}
                        disabled
                      >
                        Unavailable
                      </button>
                    ) : (
                      <button
                        style={{
                          backgroundColor: "green",
                          color: "white",
                          border: "none",
                          padding: "10px 15px",
                        }}
                        onClick={() => handleSchedule(slot)}
                      >
                        Book
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleAppointment;
