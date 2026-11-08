
import { useEffect } from "react";
import "./AddExpenseModal.css";

function AddExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  amount,
  setAmount,
  category,
  setCategory,
  description,
  setDescription,
  date,
  setDate,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="expense-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="expense-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-modal-title"
      >
        <div className="expense-modal-topline">
          <span className="expense-modal-eyebrow">
            TRAVELMINT · TRIP FINANCES
          </span>

          <button
            type="button"
            className="expense-modal-close"
            onClick={onClose}
            aria-label="Close add expense dialog"
          >
            ×
          </button>
        </div>

        <div className="expense-modal-heading">
          <span className="expense-modal-mark" aria-hidden="true">＋</span>
          <h2 id="expense-modal-title">
            Every detail <em>counts.</em>
          </h2>
          <p>Record a spend and keep your journey on budget.</p>
        </div>

        <form className="expense-modal-form" onSubmit={onSubmit}>
          <div className="expense-field">
            <label htmlFor="expense-description">What was it for?</label>
            <input
              id="expense-description"
              type="text"
              placeholder="e.g. Lunch at a local café"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={200}
              autoComplete="off"
              required
            />
          </div>

          <div className="expense-form-row">
            <div className="expense-field">
              <label htmlFor="expense-amount">Amount</label>
              <div className="expense-amount-wrap">
                <span aria-hidden="true">₹</span>
                <input
                  id="expense-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="expense-field">
              <label htmlFor="expense-date">Date</label>
              <input
                id="expense-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="expense-field">
            <label htmlFor="expense-category">Choose a category</label>
            <select
              id="expense-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              <option value="">Select a category</option>
              <option value="Food">Food & dining</option>
              <option value="Shopping">Shopping</option>
              <option value="Transport">Transport</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Activities">Activities & experiences</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button type="submit" className="expense-primary-btn">
            <span>Save expense</span>
            <span aria-hidden="true">↗</span>
          </button>

          <p className="expense-modal-footnote">
            Every entry helps you understand where your travel budget goes.
          </p>
        </form>
      </section>
    </div>
  );
}

export default AddExpenseModal;
