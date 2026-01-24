import { useState } from "react";
import api from "../api/api";
import "./NewTripModal.css";

function NewTripModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  setTitle,
  budget,
  setBudget,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  if (!isOpen) return null;

  const [mode, setMode] = useState("manual");

  // AI-only states
  const [days, setDays] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [preferences, setPreferences] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIPlan = async () => {
    setAiLoading(true);

    try {
      const res = await api.post("/trips/ai/plan", {
        days: Number(days),
        preferences,
        travelStyle,
      });

      const plan = res.data.plan;

      // AI fills the trip
      setTitle(plan.title);
      setBudget(plan.budget);

      // Auto-generate dates based on days
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + plan.days - 1);

      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);

      alert("✨ AI planned your trip. Review & click Create Trip.");
    } catch (err) {
      console.error(err);
      alert("AI planning failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>×</button>

        <h2 className="modal-title">Plan a New Trip</h2>

        {/* MODE TOGGLE */}
        <div className="modal-toggle">
          <button
            className={mode === "manual" ? "active" : ""}
            onClick={() => setMode("manual")}
          >
            Manual
          </button>
          <button
            className={mode === "ai" ? "active" : ""}
            onClick={() => setMode("ai")}
          >
            AI Plan 🤖
          </button>
        </div>

        {/* MANUAL MODE */}
        {mode === "manual" && (
          <>
            <label>Destination</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Tokyo"
            />

            <div className="modal-row">
              <div>
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <label>Budget (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />

            <button className="modal-submit" onClick={onSubmit}>
              Create Trip
            </button>
          </>
        )}

        {/* AI MODE */}
        {mode === "ai" && (
          <>
            <label>Number of Days</label>
            <input
              type="number"
              placeholder="5"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />

            <label>Travel Style</label>
            <input
              placeholder="Budget / Luxury / Backpacking"
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
            />

            <label>Preferences</label>
            <textarea
              placeholder="Food, adventure, culture, shopping..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />

            <button
              className="modal-submit"
              onClick={handleAIPlan}
              disabled={aiLoading}
            >
              {aiLoading ? "AI is thinking..." : "Generate AI Plan ✨"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default NewTripModal;
