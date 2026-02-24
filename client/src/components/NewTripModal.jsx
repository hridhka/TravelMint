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
  const [aiOptions, setAiOptions] = useState([]);

  // 🔥 Generate Multiple AI Plans
  const handleAIPlan = async () => {
    if (!days || !travelStyle || !preferences) {
      alert("Please fill all AI fields");
      return;
    }

    setAiLoading(true);

    try {
      const res = await api.post("/ai/plan", {
        days: Number(days),
        preferences,
        travelStyle,
      });

      setAiOptions(res.data.options || []);
    } catch (err) {
      console.error(err);
      alert("AI planning failed");
    } finally {
      setAiLoading(false);
    }
  };

  // 🔥 When user selects one AI plan
  const selectAIPlan = (plan) => {
    setTitle(plan.title);
    setBudget(plan.budget);

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + Number(days) - 1);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);

    setMode("manual");
    setAiOptions([]);

    alert("✨ Plan selected! Now click Create Trip.");
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

        {/* ================= MANUAL MODE ================= */}
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

        {/* ================= AI MODE ================= */}
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

            {/* 🔥 AI Trip Cards */}
            {aiOptions.length > 0 && (
              <div className="ai-options">
                {aiOptions.map((trip, index) => (
                  <div key={index} className="ai-card">
                    <h3>{trip.title}</h3>
                    <p><strong>Vibe:</strong> {trip.vibe}</p>
                    <p><strong>Budget:</strong> ₹{trip.budget}</p>
                    <p><strong>Per Day:</strong> ₹{trip.dailyBudget}</p>

                    <button
                      className="select-btn"
                      onClick={() => selectAIPlan(trip)}
                    >
                      Select This Plan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default NewTripModal;