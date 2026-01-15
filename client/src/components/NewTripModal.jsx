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

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>×</button>

        <h2 className="modal-title">Plan a New Trip</h2>

        <label>Destination</label>
        <input
          placeholder="e.g., Tokyo, Japan"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="modal-row">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <label>Budget (₹)</label>
        <input
          type="number"
          placeholder="2500"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />

        <button className="modal-submit" onClick={onSubmit}>
          Create Trip
        </button>
      </div>
    </div>
  );
}

export default NewTripModal;
