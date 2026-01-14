import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";


function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();

  // 🔴 confirm delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteTrip = async () => {
    try {
      setDeleting(true);
      await api.delete(`/trips/${trip.id}`);
      onDelete(trip.id); // remove from dashboard
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
      onClick={() => navigate(`/trips/${trip.id}`)}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "16px",
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {/* LEFT SIDE */}
      <div>
        <h3 style={{ margin: "0 0 6px 0" }}>{trip.title}</h3>

        <p style={{ margin: 0, fontSize: "16px", color: "#555" }}>
          Budget: ₹{trip.budget}
        </p>

<p style={{ margin: "4px 0 0", fontSize: "15px", color: "#777" }}>
  {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
</p>

      </div>

      {/* RIGHT SIDE */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              border: "none",
              padding: "6px 10px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🗑 Delete
          </button>
        ) : (
          <>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                background: "#e5e7eb",
                border: "none",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              onClick={deleteTrip}
              disabled={deleting}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {deleting ? "Deleting..." : "Confirm"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TripCard;
