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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTrips();
  }, [navigate]);

  const fetchTrips = async () => {
    const res = await api.get("/trips");
    setTrips(res.data);
  };

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

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "24px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ marginBottom: "16px" }}>Your Trips</h2>

        <form
          onSubmit={createTrip}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
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

        {trips.length === 0 ? (
          <p>No trips yet</p>
        ) : (
          trips.map((trip) => <TripCard key={trip.id} trip={trip} />)
        )}
      </div>
    </>
  );
}

export default Dashboard;
