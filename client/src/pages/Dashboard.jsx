import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";

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

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
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
