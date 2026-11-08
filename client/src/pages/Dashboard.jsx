
import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";
import NewTripModal from "../components/NewTripModal";
import "./Dashboard.css";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchTrips = async () => {
    try {
      setFetchError("");
      const res = await api.get("/trips");
      setTrips(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
      setFetchError("We couldn't load your trips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const createTrip = async (e) => {
    e.preventDefault();

    try {
      await api.post("/trips", {
        title,
        budget,
        start_date: startDate,
        end_date: endDate,
      });

      setTitle("");
      setBudget("");
      setStartDate("");
      setEndDate("");
      setOpenModal(false);

      await fetchTrips();
    } catch (err) {
      console.error("Failed to create trip:", err);
      alert("Couldn't create your trip. Please try again.");
    }
  };

  const handleTripDelete = (id) => {
    setTrips((prev) => prev.filter((trip) => trip.id !== id));
  };

  const totalBudget = trips.reduce(
    (sum, trip) => sum + Number(trip.budget || 0),
    0
  );

  const totalSpent = trips.reduce(
    (sum, trip) => sum + Number(trip.total_spent || 0),
    0
  );

  const overBudgetCount = trips.filter(
    (trip) =>
      Number(trip.total_spent || 0) > Number(trip.budget || 0)
  ).length;

  const remainingBudget = totalBudget - totalSpent;

  return (
    <>
      {/* Full-width panoramic background behind the navbar and hero */}
      <div
        className="dashboard-hero-background"
        aria-hidden="true"
      />

      <Navbar />

      <main className="dashboard-container">
        {/* EDITORIAL HERO */}
        <section className="editorial-hero">
          <div className="hero-copy">
            <span className="eyebrow">
              YOUR PERSONAL TRAVEL JOURNAL
            </span>

            <h1>
              The world is
              <br />
              <span>yours to wander.</span>
            </h1>

            <p>
              Collect places, plan meaningful journeys, and keep
              every rupee of your adventures in check.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => setOpenModal(true)}
              >
                Plan a new trip{" "}
                <span aria-hidden="true">↗</span>
              </button>

              <span className="hero-note">
                DREAM IT. PLAN IT. GO.
              </span>
            </div>
          </div>
        </section>

        {/* BUDGET OVERVIEW */}
        <section className="overview-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE BIG PICTURE</span>
              <h2>
                Your travel ledger<span>.</span>
              </h2>
            </div>

            <span className="overview-caption">
              {trips.length}{" "}
              {trips.length === 1 ? "journey" : "journeys"} planned
            </span>
          </div>

          <div className="summary-grid">
            <article className="summary-card summary-featured">
              <div className="summary-topline">
                <span>Total budget</span>
                <span className="summary-symbol">↗</span>
              </div>
              <h3>{formatCurrency(totalBudget)}</h3>
              <p>Your combined trip budgets</p>
            </article>

            <article className="summary-card">
              <div className="summary-topline">
                <span>Total spent</span>
                <span className="summary-symbol">↗</span>
              </div>
              <h3>{formatCurrency(totalSpent)}</h3>
              <p>Expenses recorded so far</p>
            </article>

            <article className="summary-card">
              <div className="summary-topline">
                <span>Budget remaining</span>
                <span className="summary-symbol">◷</span>
              </div>
              <h3>{formatCurrency(remainingBudget)}</h3>
              <p>Budget minus recorded expenses</p>
            </article>

            <article
              className={`summary-card ${
                overBudgetCount ? "summary-alert" : ""
              }`}
            >
              <div className="summary-topline">
                <span>Budget alerts</span>
                <span className="summary-symbol">!</span>
              </div>

              <h3>
                {overBudgetCount.toString().padStart(2, "0")}
              </h3>

              <p>
                {overBudgetCount
                  ? "Trips exceeding their budget"
                  : "All trips within budget"}
              </p>
            </article>
          </div>
        </section>

        {/* TRIP COLLECTION */}
        <section className="trips-section" id="trips">
          <div className="section-heading trips-heading">
            <div>
              <span className="eyebrow">
                YOUR PERSONAL COLLECTION
              </span>

              <h2>
                Journeys worth remembering<span>.</span>
              </h2>

              <p className="section-description">
                Every destination has a story. Here's where yours begin.
              </p>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => setOpenModal(true)}
            >
              + Add a journey
            </button>
          </div>

          {fetchError ? (
            <div className="dashboard-message" role="alert">
              <p>{fetchError}</p>

              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setLoading(true);
                  fetchTrips();
                }}
              >
                Try again ↻
              </button>
            </div>
          ) : loading ? (
            <div className="trip-grid" aria-label="Loading trips">
              {[1, 2, 3].map((item) => (
                <div className="trip-skeleton" key={item}>
                  <div className="skeleton-image" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="empty-trips">
              <span className="empty-mark">✳</span>

              <span className="eyebrow">
                A BLANK PAGE, A THOUSAND POSSIBILITIES
              </span>

              <h3>Your next great story starts here.</h3>

              <p>
                Create your first trip, set a budget, and start building
                an adventure that's entirely yours.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => setOpenModal(true)}
              >
                Create your first trip ↗
              </button>
            </div>
          ) : (
            <div className="trip-grid">
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={handleTripDelete}
                />
              ))}
            </div>
          )}

          {!loading && trips.length > 0 && (
            <div className="collection-footer">
              <span>END OF YOUR CURRENT COLLECTION</span>
              <span>MORE MEMORIES AWAIT ↗</span>
            </div>
          )}
        </section>

        {/* EDITORIAL FOOTER */}
        <footer className="dashboard-footer">
          <span>TRAVELMINT®</span>
          <span>Made for the places that stay with you.</span>
          <span>PLAN WITH PURPOSE.</span>
        </footer>
      </main>

      {/* NEW TRIP MODAL */}
      <NewTripModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={createTrip}
        title={title}
        setTitle={setTitle}
        budget={budget}
        setBudget={setBudget}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
    </>
  );
}

export default Dashboard;
