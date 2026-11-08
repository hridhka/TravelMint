
import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";
import NewTripModal from "../components/NewTripModal";
import "./MyTrips.css";

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTrips = async () => {
    try {
      setError("");
      const response = await api.get("/trips");
      setTrips(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
      setError("We couldn't load your journeys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const createTrip = async (event) => {
    event.preventDefault();

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
      setLoading(true);
      await fetchTrips();
    } catch (err) {
      console.error("Failed to create trip:", err);
      alert("Couldn't create your trip. Please try again.");
    }
  };

  const getStatus = (trip) => {
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

  const filteredTrips = useMemo(() => {
    const result = trips.filter((trip) => {
      const matchesSearch = String(trip.title || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesFilter =
        filter === "all" || getStatus(trip) === filter;

      return matchesSearch && matchesFilter;
    });

    return result.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.start_date || 0) - new Date(b.start_date || 0);
      }

      if (sort === "budget-high") {
        return Number(b.budget || 0) - Number(a.budget || 0);
      }

      if (sort === "budget-low") {
        return Number(a.budget || 0) - Number(b.budget || 0);
      }

      return new Date(b.start_date || 0) - new Date(a.start_date || 0);
    });
  }, [trips, search, filter, sort]);

  const handleTripDelete = (id) => {
    setTrips((current) => current.filter((trip) => trip.id !== id));
  };

  const upcomingCount = trips.filter(
    (trip) => getStatus(trip) === "upcoming"
  ).length;

  const ongoingCount = trips.filter(
    (trip) => getStatus(trip) === "ongoing"
  ).length;

  const completedCount = trips.filter(
    (trip) => getStatus(trip) === "completed"
  ).length;

  return (
    <>
      <div className="my-trips-background" aria-hidden="true" />
      <Navbar />

      <main className="my-trips-page">
        <section className="my-trips-hero">
          <div>
            <span className="eyebrow">YOUR PERSONAL COLLECTION</span>
            <h1>
              Every journey
              <br />
              <em>has a story.</em>
            </h1>
            <p>
              From the places you're dreaming of to the memories
              you've already made.
            </p>
          </div>

          <div className="my-trips-hero-index">
            <span>TRAVELMINT JOURNAL</span>
            <strong>{String(trips.length).padStart(2, "0")}</strong>
            <span>JOURNEYS COLLECTED</span>
          </div>
        </section>

        <section className="my-trips-overview">
          <div className="my-trips-overview-heading">
            <div>
              <span className="eyebrow">YOUR TRAVEL TIMELINE</span>
              <h2>Journeys at a glance<span>.</span></h2>
            </div>
            <button
              type="button"
              className="my-trips-add-button"
              onClick={() => setOpenModal(true)}
            >
              <span>＋</span> Plan a trip
            </button>
          </div>

          <div className="my-trips-stats">
            <article>
              <span className="my-trips-stat-number">
                {String(trips.length).padStart(2, "0")}
              </span>
              <span className="my-trips-stat-label">All journeys</span>
            </article>
            <article>
              <span className="my-trips-stat-number">{String(upcomingCount).padStart(2, "0")}</span>
              <span className="my-trips-stat-label">Upcoming</span>
            </article>
            <article>
              <span className="my-trips-stat-number">{String(ongoingCount).padStart(2, "0")}</span>
              <span className="my-trips-stat-label">In progress</span>
            </article>
            <article>
              <span className="my-trips-stat-number">{String(completedCount).padStart(2, "0")}</span>
              <span className="my-trips-stat-label">Completed</span>
            </article>
          </div>
        </section>

        <section className="my-trips-collection">
          <div className="my-trips-collection-heading">
            <div>
              <span className="eyebrow">THE COLLECTION</span>
              <h2>Your journeys<span>.</span></h2>
            </div>
            <span className="my-trips-result-count">
              {filteredTrips.length}{" "}
              {filteredTrips.length === 1 ? "journey" : "journeys"}
            </span>
          </div>

          <div className="my-trips-controls">
            <label className="my-trips-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 5 5" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a destination..."
                aria-label="Search trips"
              />
            </label>

            <label className="my-trips-select-label">
              <span>STATUS</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="all">All journeys</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <label className="my-trips-select-label">
              <span>SORT BY</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="newest">Latest first</option>
                <option value="oldest">Earliest first</option>
                <option value="budget-high">Highest budget</option>
                <option value="budget-low">Lowest budget</option>
              </select>
            </label>
          </div>

          {error ? (
            <div className="my-trips-message" role="alert">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  fetchTrips();
                }}
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="my-trips-loading">
              <span className="my-trips-spinner" />
              <p>Gathering your journeys...</p>
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="my-trips-grid">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={handleTripDelete}
                />
              ))}
            </div>
          ) : (
            <div className="my-trips-empty">
              <span className="my-trips-empty-mark">✳</span>
              <span className="eyebrow">
                {search || filter !== "all"
                  ? "NO MATCHING JOURNEYS"
                  : "A NEW CHAPTER"}
              </span>
              <h3>
                {search || filter !== "all"
                  ? "No journeys found."
                  : "Somewhere wonderful awaits."}
              </h3>
              <p>
                {search || filter !== "all"
                  ? "Try another search or change your filters."
                  : "Create your first trip and start collecting places worth remembering."}
              </p>
              {search || filter !== "all" ? (
                <button
                  type="button"
                  className="my-trips-add-button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  className="my-trips-add-button"
                  onClick={() => setOpenModal(true)}
                >
                  ＋ Plan your first trip
                </button>
              )}
            </div>
          )}
        </section>

        <footer className="my-trips-footer">
          <span>TRAVELMINT®</span>
          <span>Made for the places that stay with you.</span>
          <span>KEEP WANDERING.</span>
        </footer>
      </main>

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

export default MyTrips;
