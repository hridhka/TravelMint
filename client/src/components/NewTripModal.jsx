
import { useEffect, useState } from "react";
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
  const [mode, setMode] = useState("manual");

  const [days, setDays] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [preferences, setPreferences] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOptions, setAiOptions] = useState([]);
  const [aiError, setAiError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  // Keep hooks unconditional, even when the modal is closed.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !aiLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, aiLoading, onClose]);

  if (!isOpen) return null;

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setAiError("");
  };

  const handleAIPlan = async () => {
    const duration = Number(days);

    // Validate all required AI planning inputs.
    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 60 ||
      !travelStyle.trim() ||
      !preferences.trim()
    ) {
      setAiError(
        "Enter a duration of 1–60 whole days, your travel style, and your preferences."
      );
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiOptions([]);
    setSelectedPlan("");

    try {
      const res = await api.post("/ai/plan", {
        days: duration,
        preferences: preferences.trim(),
        travelStyle: travelStyle.trim(),
      });

      const options = res.data?.options;

      if (!Array.isArray(options) || options.length === 0) {
        setAiError("No trip ideas were returned. Please try again.");
        return;
      }

      setAiOptions(options);
    } catch (err) {
      console.error("AI PLANNING ERROR:", err);

      setAiError(
        err.response?.data?.message ||
          "We couldn't generate your plans. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const selectAIPlan = (plan, index) => {
    // Selecting an idea fills the form; it does not create a trip.
    setTitle(plan.title || "");
    setBudget(String(plan.budget ?? ""));

    // Use local dates to avoid UTC timezone shifts.
    const start = new Date();
    const end = new Date();

    end.setDate(start.getDate() + Number(days) - 1);

    const toLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    setStartDate(toLocalDate(start));
    setEndDate(toLocalDate(end));

    setSelectedPlan(String(index));
    setMode("manual");
    setAiError("");
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !aiLoading) {
          onClose();
        }
      }}
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-trip-title"
      >
        <div className="modal-topline">
          <span className="modal-eyebrow">
            TRAVELMINT · YOUR NEXT CHAPTER
          </span>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={aiLoading}
            aria-label="Close new trip dialog"
          >
            ×
          </button>
        </div>

        <div className="modal-heading">
          <h2 id="new-trip-title" className="modal-title">
            Every journey
            <br />
            starts <em>somewhere.</em>
          </h2>

          <p className="modal-description">
            Shape your next adventure, one thoughtful detail at a time.
          </p>
        </div>

        <div className="modal-toggle" aria-label="Trip planning method">
          <button
            type="button"
            className={mode === "manual" ? "active" : ""}
            aria-pressed={mode === "manual"}
            onClick={() => handleModeChange("manual")}
          >
            <span className="toggle-number">01</span>
            Plan your own
          </button>

          <button
            type="button"
            className={mode === "ai" ? "active" : ""}
            aria-pressed={mode === "ai"}
            onClick={() => handleModeChange("ai")}
          >
            <span className="toggle-number">02</span>
            AI inspiration
          </button>
        </div>

        {mode === "manual" && (
          <form className="modal-form" onSubmit={onSubmit}>
            <div className="modal-field">
              <label htmlFor="trip-destination">Where are you headed?</label>
              <input
                id="trip-destination"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Kyoto, Japan"
                autoComplete="off"
                required
                maxLength={100}
              />
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label htmlFor="trip-start-date">Departure</label>
                <input
                  id="trip-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);

                    if (endDate && event.target.value > endDate) {
                      setEndDate("");
                    }
                  }}
                  required
                />
              </div>

              <div className="modal-field">
                <label htmlFor="trip-end-date">Return</label>
                <input
                  id="trip-end-date"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-field">
              <label htmlFor="trip-budget">Your total budget</label>
              <div className="budget-input-wrap">
                <span aria-hidden="true">₹</span>
                <input
                  id="trip-budget"
                  type="number"
                  min="1"
                  step="1"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="e.g. 25000"
                  required
                />
              </div>
              <p className="field-hint">
                Set a budget now. You can track your actual expenses later.
              </p>
            </div>

            <button className="modal-submit" type="submit">
              <span>Create my trip</span>
              <span aria-hidden="true">↗</span>
            </button>

            <p className="modal-footnote">
              Your itinerary starts here. Expenses can be added after creation.
            </p>
          </form>
        )}

        {mode === "ai" && (
          <div className="modal-form">
            <div className="ai-intro">
              <span className="ai-sparkle" aria-hidden="true">
                ✳
              </span>
              <div>
                <h3>Find your kind of adventure</h3>
                <p>
                  Tell us what you love. We'll ask TravelMint AI for trip ideas.
                </p>
              </div>
            </div>

            <div className="modal-field">
              <label htmlFor="ai-days">How long are you travelling?</label>
              <div className="days-input-wrap">
                <input
                  id="ai-days"
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                  placeholder="5"
                />
                <span>days</span>
              </div>
            </div>

            <div className="modal-field">
              <label htmlFor="ai-style">Your travel style</label>
              <input
                id="ai-style"
                type="text"
                value={travelStyle}
                onChange={(event) => setTravelStyle(event.target.value)}
                placeholder="Slow travel, luxury, backpacking…"
                maxLength={100}
              />

              <div className="style-chips">
                {["Budget", "Culture", "Adventure", "Relaxation"].map(
                  (style) => (
                    <button
                      type="button"
                      key={style}
                      className={`style-chip ${
                        travelStyle.toLowerCase() === style.toLowerCase()
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setTravelStyle(style)}
                    >
                      {style}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="modal-field">
              <label htmlFor="ai-preferences">
                What would make it special?
              </label>
              <textarea
                id="ai-preferences"
                value={preferences}
                onChange={(event) => setPreferences(event.target.value)}
                placeholder="Street food, mountain views, hidden cafés, local culture…"
                rows={3}
                maxLength={600}
              />
            </div>

            {aiError && (
              <p className="modal-error" role="alert">
                {aiError}
              </p>
            )}

            <button
              type="button"
              className="modal-submit"
              onClick={handleAIPlan}
              disabled={aiLoading}
            >
              <span>
                {aiLoading ? "Finding inspiration…" : "Discover trip ideas"}
              </span>
              <span aria-hidden="true">{aiLoading ? "…" : "✳"}</span>
            </button>

            {aiLoading && (
              <p className="ai-loading-note" role="status">
                Thinking through destinations, travel styles, and budgets…
              </p>
            )}

            {aiOptions.length > 0 && (
              <div className="ai-options">
                <div className="ai-results-heading">
                  <span className="modal-eyebrow">CURATED FOR YOU</span>
                  <h3>Choose your direction</h3>
                </div>

                {aiOptions.map((plan, index) => (
                  <article
                    className="ai-card"
                    key={`${plan.title}-${index}`}
                  >
                    <div className="ai-card-top">
                      <span className="ai-card-number">
                        IDEA {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="ai-card-mark" aria-hidden="true">
                        ↗
                      </span>
                    </div>

                    <h4>{plan.title}</h4>

                    {plan.vibe && (
                      <p className="ai-card-vibe">{plan.vibe}</p>
                    )}

                    <div className="ai-card-budget">
                      <div>
                        <span>ESTIMATED TOTAL</span>
                        <strong>{formatMoney(plan.budget)}</strong>
                      </div>

                      {plan.dailyBudget != null && (
                        <div>
                          <span>PER DAY</span>
                          <strong>{formatMoney(plan.dailyBudget)}</strong>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`select-btn ${
                        selectedPlan === String(index) ? "selected" : ""
                      }`}
                      onClick={() => selectAIPlan(plan, index)}
                    >
                      {selectedPlan === String(index)
                        ? "Selected — review details below"
                        : "Choose this idea"}
                      <span aria-hidden="true">→</span>
                    </button>
                  </article>
                ))}

                <p className="ai-results-note">
                  Choosing an idea fills in your trip details. Review them before
                  creating your trip.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default NewTripModal;
