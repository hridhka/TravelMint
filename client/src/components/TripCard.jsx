import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./TripCard.css";

function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteTrip = async () => {
    try {
      setDeleting(true);
      await api.delete(`/trips/${trip.id}`);
      onDelete(trip.id);
    } catch (err) {
      console.error("DELETE TRIP ERROR:", err);
      alert("Failed to delete trip");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div
      className="trip-card"
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      {/* LEFT */}
      <div className="trip-info">
        <h3>{trip.title}</h3>

        <p className="trip-budget">
          Budget: ₹{trip.budget}
        </p>

        <p className="trip-dates">
          📅 {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
        </p>
      </div>

      {/* RIGHT */}
      <div
        className="trip-actions"
        onClick={(e) => e.stopPropagation()}
      >
        {!confirmDelete ? (
          <button
            className="delete-btn"
            onClick={() => setConfirmDelete(true)}
          >
            🗑
          </button>
        ) : (
          <div className="confirm-box">
            <button
              className="cancel-btn"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>

            <button
              className="confirm-btn"
              onClick={deleteTrip}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Confirm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TripCard;
