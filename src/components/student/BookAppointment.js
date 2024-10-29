import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./BookAppointment.css";

const BookAppointment = () => {
  const { user } = useAuthContext();
  const [teachers, setTeachers] = useState([]);
  const [student, setStudent] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [unavailableSlots, setUnavailableSlots] = useState([]); // To store unavailable slots
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState(null);
  const timeSlots = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const snapshot = await db.collection("teachers").get();
        const teachersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeachers(teachersData);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchStudent = async () => {
      try {
        const studentDoc = await db.collection("students").doc(user.uid).get();
        if (studentDoc.exists) {
          setStudent(studentDoc.data());
        } else {
          setError("Student not found.");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTeachers();
    fetchStudent();
  }, [user.uid]);

  const fetchAppointmentsAndUnavailableSlots = async (
    selectedTeacherId,
    selectedDate
  ) => {
    try {
      // Fetch booked appointments
      const appointmentsSnapshot = await db
        .collection("appointments")
        .where("teacherUid", "==", selectedTeacherId)
        .where("date", "==", selectedDate)
        .get();

      const appointmentsData = appointmentsSnapshot.docs.map((doc) =>
        doc.data()
      );
      setAppointments(appointmentsData);

      // Fetch unavailable slots
      const unavailableSnapshot = await db
        .collection("unavailableSlots")
        .where("teacherUid", "==", selectedTeacherId)
        .where("date", "==", selectedDate)
        .get();

      const unavailableData = unavailableSnapshot.docs.map((doc) => doc.data());
      setUnavailableSlots(unavailableData);
    } catch (error) {
      setError("Error fetching data.");
    }
  };

  useEffect(() => {
    if (selectedTeacher && date) {
      fetchAppointmentsAndUnavailableSlots(selectedTeacher, date);
    }
  }, [selectedTeacher, date]);

  const isSlotUnavailable = (time) => {
    return unavailableSlots.some((slot) => slot.time === time);
  };

  const isSlotBooked = (time) => {
    return appointments.some((appointment) => appointment.time === time);
  };

  const handleBook = async (timeSlot) => {
    const today = new Date();
    const selectedDate = new Date(date);

    if (selectedDate < today.setHours(0, 0, 0, 0)) {
      // Check if selected date is in the past
      setError("You cannot book an appointment for a past date.");
      return;
    }

    if (!selectedTeacher || !date) {
      setError("Please select a teacher and date before booking.");
      return;
    }

    try {
      await db.collection("appointments").add({
        studentUid: user.uid,
        studentId: student.studentid,
        studentName: student.displayName,
        teacherUid: selectedTeacher,
        teacherId: teachers.find((teacher) => teacher.id === selectedTeacher)
          .teacherid,
        teacherName: teachers.find((teacher) => teacher.id === selectedTeacher)
          .displayName,
        date,
        time: timeSlot,
        status: "pending",
      });

      fetchAppointmentsAndUnavailableSlots(selectedTeacher, date); // Refresh the slots
      alert("Appointment booked successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const minDate = tomorrowDate.toISOString().split("T")[0];

  return (
    <div className="book-appointment">
      <h2 className="page-title">Book Appointment</h2>
      <form className="appointment-form">
        <label>
          Select Teacher:
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            required
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.displayName} - {teacher.teacherid}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date:
          <input
            type="date"
            value={date}
            min={minDate} // Prevent selecting past dates
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
      </form>
      {error && <p className="error">{error}</p>}

      {selectedTeacher && date && (
        <div className="time-slots">
          <table
            className="time-slot-table"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>
                  Time Slot
                </th>
                <th>
                  Status
                </th>
                <th>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {slot}
                  </td>
                  <td>
                    <span>
                      {isSlotBooked(slot)
                        ? "Booked"
                        : isSlotUnavailable(slot)
                        ? "Unavailable"
                        : "Free"}
                    </span>
                  </td>
                  <td>
                    <button
                      style={{
                        backgroundColor:
                          isSlotBooked(slot) || isSlotUnavailable(slot)
                            ? "red"
                            : "green",
                        color: "white",
                        border: "none",
                        padding: "10px 15px",
                        cursor:
                          isSlotBooked(slot) || isSlotUnavailable(slot)
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          isSlotBooked(slot) || isSlotUnavailable(slot)
                            ? 0.6
                            : 1,
                        borderRadius: "5px",
                        fontSize: "16px",
                      }}
                      onClick={() => handleBook(slot)}
                      disabled={isSlotBooked(slot) || isSlotUnavailable(slot)}
                    >
                      {isSlotBooked(slot) || isSlotUnavailable(slot)
                        ? "Unavailable"
                        : "Book"}
                    </button>
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

export default BookAppointment;
