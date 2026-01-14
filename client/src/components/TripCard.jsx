import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./TripCard.css";

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation(); // 🚫 don’t open trip when deleting

    const ok = window.confirm(
      `Delete "${trip.title}"?\nThis will remove all expenses too.`
    );
    if (!ok) return;

    try {
      await api.delete(`/trips/${trip.id}`);
      onDelete(trip.id); // 🔁 update UI instantly
    } catch (err) {
      alert("Failed to delete trip");
    }
  };

  return (
    <div
      className="trip-card"
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      <h3>{trip.title}</h3>

      <p className="budget">
        Budget: <strong>₹{trip.budget}</strong>
      </p>

      {/* 🗓️ Dates */}
      <p className="dates">
        <span>📅 {formatDate(trip.start_date)}</span>
        <span> → </span>
        <span>{formatDate(trip.end_date)}</span>
      </p>
      <button
        className="trip-delete-btn"
        onClick={handleDelete}
        title="Delete Trip"
      >
        🗑
      </button>
      
    </div>
    
  );
}

export default TripCard;
