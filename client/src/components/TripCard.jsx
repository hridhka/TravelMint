import { useNavigate } from "react-router-dom";

function TripCard({ trip }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/trips/${trip.id}`)}
      style={{
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "#fff",
        marginBottom: "12px",
        cursor: "pointer",
      }}
    >
      <h3 style={{ marginBottom: "6px" }}>{trip.title}</h3>
      <p>Budget: ₹{trip.budget}</p>
    </div>
  );
}

export default TripCard;
