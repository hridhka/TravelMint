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
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // 🔢 calculations
  const spent = Number(trip.total_spent || 0);
  const budget = Number(trip.budget || 0);
  const percent = budget ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget;

  // 🖼️ image (ADDED)
const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(
  trip.title + "-travel-city"
)}/600/400`;




  return (
    <div
      className="trip-card"
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      {/* IMAGE HEADER */}
      <div
        className="trip-image"
        style={{
          backgroundImage: `url(${imageUrl})`, // ✅ ADDED
        }}
      >
        <span className={`status ${overBudget ? "danger" : "success"}`}>
          {overBudget ? "Over Budget" : "On Track"}
        </span>

        <h3 className="trip-title">{trip.title}</h3>
        <p className="trip-dates">
          📅 {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
        </p>
      </div>

      {/* BODY */}
      <div className="trip-body">
        <div className="trip-row">
          <h2>₹{spent.toLocaleString()}</h2>
          <span>{trip.expense_count || 0} expenses</span>
        </div>

        <p className="trip-sub">
          of ₹{budget.toLocaleString()} budget
        </p>

        {/* PROGRESS BAR */}
        <div className="progress">
          <div
            className={`progress-fill ${overBudget ? "danger" : "success"}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* WARNING */}
        {overBudget && (
          <div className="warning">
            ⚠ You’re ₹{(spent - budget).toLocaleString()} over budget!
          </div>
        )}

        {/* DELETE ACTIONS (UNCHANGED) */}
        <div
          className="trip-actions"
          onClick={(e) => e.stopPropagation()}
        >
          {!confirmDelete ? (
            <button
              className="delete-icon"
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
    </div>
  );
}

export default TripCard;
