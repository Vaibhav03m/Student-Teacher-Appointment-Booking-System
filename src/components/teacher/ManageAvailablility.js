import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./ManageAvailability.css";

const ManageAvailability = () => {
  const { user } = useAuthContext();
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState("");
  const [error, setError] = useState(null);

  const timeSlots = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

  // Fetch teacher's unavailable slots and appointments
  useEffect(() => {
    if (date) {
      fetchUnavailableSlots(date);
      fetchAppointments(date);
    }
  }, [date]);

  const fetchUnavailableSlots = async (selectedDate) => {
    try {
      const snapshot = await db
        .collection("unavailableSlots")
        .where("teacherUid", "==", user.uid)
        .where("date", "==", selectedDate)
        .get();
      const unavailableData = snapshot.docs.map((doc) => doc.data());
      setUnavailableSlots(unavailableData);
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

  // Check if slot is booked by any appointment
  const isSlotBooked = (timeSlot) => {
    return appointments.some((appointment) => appointment.time === timeSlot);
  };

  // Check if slot is unavailable (not marked as available)
  const isSlotUnavailable = (timeSlot) => {
    return unavailableSlots.some((slot) => slot.time === timeSlot);
  };

  const handleMarkAvailable = async (timeSlot) => {
    try {
      const snapshot = await db
        .collection("unavailableSlots")
        .where("teacherUid", "==", user.uid)
        .where("date", "==", date)
        .where("time", "==", timeSlot)
        .get();

      snapshot.forEach(async (doc) => {
        await db.collection("unavailableSlots").doc(doc.id).delete();
      });

      fetchUnavailableSlots(date);
      alert("Slot marked as available!");
    } catch (error) {
      setError("Error marking slot as available.");
    }
  };

  const handleMarkUnavailable = async (timeSlot) => {
    try {
      await db.collection("unavailableSlots").add({
        teacherUid: user.uid,
        date,
        time: timeSlot,
      });

      fetchUnavailableSlots(date);
      alert("Slot marked as unavailable!");
    } catch (error) {
      setError("Error marking slot as unavailable.");
    }
  };

  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div className="manage-availability-container">
      <h2 className="page-title">Manage Availability</h2>
      <form className="availability-form">
        <label className="form-label">
          Date:
          <input
            type="date"
            value={date}
            min={todayDate}
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
                      : "Available"}
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
                        className="available-button"
                        onClick={() => handleMarkAvailable(slot)}
                        style={{
                          backgroundColor: "green",
                          color: "white",
                          border: "none",
                          padding: "10px 15px",
                        }}
                      >
                        Mark Available
                      </button>
                    ) : (
                      <button
                        className="unavailable-button"
                        onClick={() => handleMarkUnavailable(slot)}
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          padding: "10px 15px",
                        }}
                      >
                        Mark Unavailable
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

export default ManageAvailability;
