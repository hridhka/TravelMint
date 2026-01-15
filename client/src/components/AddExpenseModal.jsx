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
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>Add Expense</h2>

        <form onSubmit={onSubmit}>
          <label>Description</label>
          <input
            placeholder="e.g., Lunch at local restaurant"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="row">
            <div>
              <label>Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            <option value="Food">Food</option>
            <option value="Shopping">Shopping</option>
            <option value="Transport">Transport</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Activities">Activities</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit" className="primary-btn">
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
