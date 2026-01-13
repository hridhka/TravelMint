import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import TripCard from "../components/TripCard";
import Navbar from "../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🔐 Auth check + initial data load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchTrips();
  }, [navigate]);

  const fetchTrips = async () => {
    try {
      const res = await api.get("/trips");
      setTrips(res.data);
    } catch (err) {
      console.error("Failed to fetch trips", err);
    }
  };

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

      fetchTrips();
    } catch (err) {
      console.error("Failed to create trip", err);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>Your Trips</h2>

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

        <div style={{ marginTop: "20px" }}>
          {trips.length === 0 ? (
            <p>No trips yet</p>
          ) : (
            trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
