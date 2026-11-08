
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./TripCard.css";

const destinationImages = {
  bali: "photo-1537996194471-e657df975ab4",
  tokyo: "photo-1540959733332-eab4deabeeaf",
  japan: "photo-1493976040374-85c8e12f0c0e",
  paris: "photo-1502602898657-3e91760cbb34",
  rome: "photo-1552832230-c0197dd311b5",
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
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const spent = Number(trip.total_spent || 0);
  const budget = Number(trip.budget || 0);
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget;
  const remaining = budget - spent;

  const destinationKey = String(trip.title || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  const imageId = destinationImages[destinationKey];

  const imageUrl = imageId
    ? `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=900&q=85`
    : `https://picsum.photos/seed/${encodeURIComponent(
        `${trip.title}-travel-city`
      )}/900/650`;

  return (
    <article
      className="trip-card card-3d"
      onClick={() => {
        if (!confirmDelete) navigate(`/trips/${trip.id}`);
      }}
    >
      {/* DESTINATION PHOTOGRAPH */}
      <div
        className="trip-image"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        <div className="trip-image-shade" />

        <span className={`status ${overBudget ? "danger" : "success"}`}>
          <span className="status-dot" />
          {overBudget ? "Over budget" : "On track"}
        </span>

        <span className="trip-image-kicker">YOUR JOURNEY</span>

        <div className="trip-image-heading">
          <h3 className="trip-title">{trip.title}</h3>
          <p className="trip-dates">
            {formatDate(trip.start_date)}
            <span aria-hidden="true"> — </span>
            {formatDate(trip.end_date)}
          </p>
        </div>

        <span className="trip-image-arrow" aria-hidden="true">
          ↗
        </span>
      </div>

      {/* BUDGET DETAILS */}
      <div className="trip-body">
        <div className="trip-budget-heading">
          <div>
            <span className="trip-overline">TOTAL SPENT</span>
            <h4 className="trip-spent">{formatMoney(spent)}</h4>
          </div>

          <div className="trip-expense-count">
            <span className="expense-count-number">
              {Number(trip.expense_count || 0)}
            </span>
            <span>expenses</span>
          </div>
        </div>

        <div className="trip-budget-meta">
          <span>Budget: {formatMoney(budget)}</span>
          <span className={overBudget ? "budget-negative" : ""}>
            {budget > 0 ? `${Math.round((spent / budget) * 100)}% used` : "No budget"}
          </span>
        </div>

        <div
          className="progress"
          role="progressbar"
          aria-label={`Budget spent for ${trip.title}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
        >
          <div
            className={`progress-fill ${overBudget ? "danger" : "success"}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="trip-bottom-row">
          <div className="trip-remaining">
            <span className="remaining-label">
              {overBudget ? "Amount over budget" : "Available to spend"}
            </span>
            <span className={overBudget ? "budget-negative" : "remaining-amount"}>
              {formatMoney(Math.abs(remaining))}
            </span>
          </div>

          <div
            className="trip-actions"
            onClick={(e) => e.stopPropagation()}
          >
            {!confirmDelete ? (
              <button
                type="button"
                className="delete-icon"
                aria-label={`Delete ${trip.title}`}
                title="Delete trip"
                onClick={() => setConfirmDelete(true)}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="m19 6-1 14H6L5 6" />
                  <path d="M10 11v5M14 11v5" />
                </svg>
              </button>
            ) : (
              <div className="confirm-box">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-btn"
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
          <div className="warning">
            You've exceeded this trip's budget by {formatMoney(spent - budget)}.
          </div>
        )}
      </div>
    </article>
  );
}

export default TripCard;
