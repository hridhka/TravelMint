import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";
import "./Dashboard.css";

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTrips = async () => {
    const res = await api.get("/trips");
    setTrips(res.data);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const createTrip = async (e) => {
    e.preventDefault();

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
    fetchTrips();
  };

  // 🔥 REMOVE TRIP FROM UI AFTER DELETE
  const handleTripDelete = (id) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <Navbar />
      

<div
  style={{
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px 16px",
  }}
>

  <h1 style={{ margin: 0 }}>Welcome back! 👋</h1>
  <p style={{ marginTop: "6px", color: "#6b7280" }}>
    Track your travel expenses and stay on budget.
  </p>




        <h2>Your Trips</h2>
        {/* ===== SUMMARY CARDS ===== */}
<div className="summary-grid">
  <div className="summary-card green">
    <p className="label">Total Budget</p>
    <h2>₹{trips.reduce((a, t) => a + Number(t.budget), 0)}</h2>
    <span>Across all trips</span>
  </div>

  <div className="summary-card white">
    <p className="label">Total Spent</p>
    <h2>₹{trips.reduce((a, t) => a + Number(t.total_spent || 0), 0)}</h2>
    <span>Tracked so far</span>
  </div>

  <div className="summary-card white">
    <p className="label">Active Trips</p>
    <h2>{trips.length}</h2>
    <span>Total planned</span>
  </div>

  <div className="summary-card orange">
    <p className="label">Over Budget</p>
    <h2>{trips.filter(t => t.over_budget).length}</h2>
    <span>Needs attention</span>
  </div>
</div>


        <form onSubmit={createTrip}>
          <input
            placeholder="Trip title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <button>Create Trip</button>
        </form>

        <div style={{ marginTop: "30px" }}>
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDelete={handleTripDelete}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
