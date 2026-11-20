
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./TripCard.css";

const destinationImages = {
  bali: "photo-1537996194471-e657df975ab4",
  tokyo: "photo-1540959733332-eab4deabeeaf",
  kyoto: "photo-1493976040374-85c8e12f0c0e",
  japan: "photo-1493976040374-85c8e12f0c0e",
  paris: "photo-1502602898657-3e91760cbb34",
  rome: "photo-1552832230-c0197dd311b5",
  italy: "photo-1552832230-c0197dd311b5",
  dubai: "photo-1512453979798-5ea266f8880c",
  london: "photo-1513635269975-59663e0ac1ad",
  bangkok: "photo-1508009603885-50cf7c579365",
  singapore: "photo-1525625293386-3f8f99389edd",
  manali: "photo-1626621341517-bbf3d9990a23",
  iceland: "photo-1476610182048-b716b8518aae",
  switzerland: "photo-1531366936337-7c912a4589a7",
  kerala: "photo-1602216056096-3b40cc0c9944",
  goa: "photo-1512343879784-a960bf40e7f2",
  maldives: "photo-1514282401047-d79a71a590e8",
  newyork: "photo-1496442226666-8d4d0e62e6e9",
  barcelona: "photo-1583422409516-2895a77efded",
  jaipur: "photo-1599661046827-dacff0c0f09a",
  rajasthan: "photo-1599661046827-dacff0c0f09a",
  china: "photo-1508804185872-d7badad00f7d",
};

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
    if (!dateStr) return "Date not set";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "Date not set";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const getStatus = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = trip.start_date ? new Date(trip.start_date) : null;
    const end = trip.end_date ? new Date(trip.end_date) : null;

    if (start && !Number.isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0);
    }

    if (end && !Number.isNaN(end.getTime())) {
      end.setHours(0, 0, 0, 0);
    }

    if (start && end && today >= start && today <= end) {
      return "ongoing";
    }

    if (end && today > end) {
      return "completed";
    }

    return "upcoming";
  };

  const spent = Number(trip.total_spent || 0);
  const budget = Number(trip.budget || 0);
  const expenseCount = Number(trip.expense_count || 0);

  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const progress = Math.min(percentage, 100);
  const overBudget = budget > 0 && spent > budget;

  const status = getStatus();

  const destinationKey = String(
    trip.destination || trip.location || trip.title || ""
  )
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  const imageKey = Object.keys(destinationImages).find((key) =>
    destinationKey.includes(key)
  );

  const imageId = imageKey ? destinationImages[imageKey] : null;

  const imageUrl = imageId
    ? `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=900&q=85`
    : `https://picsum.photos/seed/${encodeURIComponent(
        `${trip.title}-travel-city`
      )}/900/650`;

  const destination = trip.destination || trip.location || "";
  const showDestination =
    destination.trim().toLowerCase() !==
    String(trip.title || "").trim().toLowerCase();

  return (
    <article
      className="trip-card"
      onClick={() => {
        if (!confirmDelete) navigate(`/trips/${trip.id}`);
      }}
    >
      {/* DESTINATION IMAGE */}
      <div
        className="trip-card-image"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        <div className="trip-card-image-overlay" />

        <span className={`trip-card-status ${status}`}>
          {status === "ongoing" && <span className="status-dot" />}
          {status === "upcoming" && (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" />
            </svg>
          )}
          {status === "completed" && <span className="status-check">✓</span>}

          {status === "ongoing"
            ? "In Progress"
            : status === "upcoming"
              ? "Upcoming"
              : "Completed"}
        </span>

        <div className="trip-card-image-content">
          <h3>{trip.title}</h3>

          {showDestination && destination && (
            <p className="trip-card-destination">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z" />
                <circle cx="12" cy="10" r="2.3" />
              </svg>
              {destination}
            </p>
          )}
        </div>
      </div>

      {/* TRIP INFORMATION */}
      <div className="trip-card-body">
        <div className="trip-card-info">
          <div className="trip-card-info-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" />
            </svg>
            <span>
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </span>
          </div>

          <div className="trip-card-info-item budget-info">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2.5" y="6" width="19" height="15" rx="2" />
              <path d="M16 14h5.5M6 6V4h12v2" />
              <circle cx="17" cy="13.5" r="0.8" />
            </svg>
            <span>
              {formatMoney(spent)} / {formatMoney(budget)}
            </span>
          </div>
        </div>

        {/* BUDGET PROGRESS */}
        <div className="trip-card-progress-row">
          <div
            className="trip-card-progress"
            role="progressbar"
            aria-label={`Budget spent for ${trip.title}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className={`trip-card-progress-fill ${
                overBudget ? "danger" : "success"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className={overBudget ? "over-budget-text" : ""}>
            {budget > 0 ? `${Math.round(percentage)}%` : "0%"}
          </span>
        </div>

        {/* CARD FOOTER */}
        <div className="trip-card-footer">
          <div className="trip-card-footer-info">
            <span className="trip-card-expenses">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="3" width="14" height="18" rx="1.5" />
                <path d="M9 8h6M9 12h6M9 16h4" />
              </svg>
              {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
            </span>
          </div>

          <div
            className="trip-card-actions"
            onClick={(event) => event.stopPropagation()}
          >
            {!confirmDelete ? (
              <button
                type="button"
                className="trip-card-delete"
                title="Delete trip"
                aria-label={`Delete ${trip.title}`}
                onClick={() => setConfirmDelete(true)}
              >
                ×
              </button>
            ) : (
              <div className="trip-card-confirm">
                <button
                  type="button"
                  className="confirm-cancel"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-delete"
                  onClick={deleteTrip}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>

        {overBudget && (
          <p className="trip-card-warning">
            Over budget by {formatMoney(spent - budget)}
          </p>
        )}
      </div>
    </article>
  );
}

export default TripCard;
