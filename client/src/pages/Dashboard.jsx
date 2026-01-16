import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";
import NewTripModal from "../components/NewTripModal"; // ✅ modal import
import "./Dashboard.css";


function Dashboard() {
  const [trips, setTrips] = useState([]);

  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [openModal, setOpenModal] = useState(false); // ✅ modal state

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
        {/* ===== HEADER ===== */}
        <h1 style={{ margin: 0, fontSize: "35px" }}>Welcome back! 👋</h1>
        <p style={{ marginTop: "6px", color: "#6b7280", fontSize: "17px" }}>
          Track your travel expenses and stay on budget.
        </p>

        {/* ===== NEW TRIP BUTTON ===== */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => setOpenModal(true)}
            style={{
              background: "#029061",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              marginBottom: "16px",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + New Trip
          </button>
        </div>


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
            <h2>
  {trips.filter(t => Number(t.total_spent) > Number(t.budget)).length}
</h2>

            <span>Needs attention</span>
          </div>
        </div>
        <h2 style={{ marginTop: "24px"}}>Your Trips</h2>

        {/* ===== TRIP LIST ===== */}
        <div className="trip-grid">
  {trips.map((trip) => (
    <TripCard
      key={trip.id}
      trip={trip}
      onDelete={handleTripDelete}
    />
  ))}
</div>

      </div>

      {/* ===== CREATE TRIP MODAL ===== */}
      <NewTripModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={(e) => {
          createTrip(e);
          setOpenModal(false);
        }}
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
