import { useNavigate } from "react-router-dom";

function TripCard({ trip }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/trip/${trip.id}`)}
      style={{
        border: "1px solid #ccc",
        padding: "12px",
        marginBottom: "10px",
        cursor: "pointer",
      }}
    >
      <h3>{trip.title}</h3>
      <p>Budget: ₹{trip.budget}</p>
      <p>
        {trip.start_date} → {trip.end_date}
      </p>
    </div>
  );
}

export default TripCard;
