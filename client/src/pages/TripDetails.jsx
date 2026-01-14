import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import "./TripDetails.css";

function TripDetails() {
  const { id } = useParams();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  // ✏️ EDIT STATE
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    amount: "",
    category: "",
    description: "",
    expense_date: "",
  });

  // 🗑 INLINE DELETE STATE
  const [deleteId, setDeleteId] = useState(null);

  // ✅ DATE FORMATTER
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchExpenses = async () => {
    const res = await api.get(`/expenses/${id}`);
    setExpenses(res.data);
  };

  const fetchSummary = async () => {
    const res = await api.get(`/trips/${id}/summary`);
    setSummary(res.data);
  };

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, [id]);

  // ➕ ADD EXPENSE
  const addExpense = async (e) => {
    e.preventDefault();
    await api.post("/expenses", {
      trip_id: id,
      amount,
      category,
      description,
      expense_date: date,
    });
    setAmount("");
    setCategory("");
    setDescription("");
    setDate("");
    fetchExpenses();
    fetchSummary();
  };

  // 🗑 DELETE EXPENSE
  const deleteExpense = async (expenseId) => {
    try {
      await api.delete(`/expenses/${expenseId}`);
      setDeleteId(null);
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  // ✏️ START EDIT
  const startEdit = (e) => {
    setEditingId(e.id);
    setEditData({
      amount: e.amount,
      category: e.category,
      description: e.description,
      expense_date: e.expense_date?.split("T")[0],
    });
  };

  // 💾 SAVE EDIT
  const saveEdit = async () => {
    await api.put(`/expenses/${editingId}`, editData);
    setEditingId(null);
    fetchExpenses();
    fetchSummary();
  };

  // ❌ CANCEL EDIT
  const cancelEdit = () => {
    setEditingId(null);
  };

  // 📊 CATEGORY TOTALS
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  return (
    <>
      <Navbar />

      <div className="trip-container">
        <h2>Trip Details</h2>

        {/* ✅ FIXED SUMMARY SECTION (THIS WAS THE ISSUE) */}
        {summary && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
              background: "#fff",
              maxWidth: "400px",
            }}
          >
            <p style={{ margin: "6px 0" }}>
              <strong>Budget:</strong> ₹{summary.budget}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Total Spent:</strong> ₹{summary.totalSpent}
            </p>
            <p
              style={{
                margin: "6px 0",
                color: summary.overBudget ? "#dc2626" : "#111",
              }}
            >
              <strong>Remaining:</strong> ₹{summary.remaining}{" "}
              {summary.overBudget && "⚠ Over Budget"}
            </p>
          </div>
        )}

        {/* ➕ ADD FORM */}
        <form className="expense-form" onSubmit={addExpense}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <button>Add Expense</button>
        </form>

        {/* 📊 CATEGORY PILLS */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="category-section">
            <h4>Spent by Category</h4>
            <div className="category-pills">
              {Object.entries(categoryTotals).map(([cat, total]) => (
                <span key={cat} className="pill">
                  {cat}: ₹{total}
                </span>
              ))}
            </div>
          </div>
        )}

        <h3>Expenses</h3>

        {expenses.length === 0 ? (
          <p>No expenses yet</p>
        ) : (
          <div className="expense-list">
            {expenses.map((e) => (
              <div key={e.id} className="expense-card">
                {editingId === e.id ? (
                  <div className="edit-box">
                    <input
                      type="number"
                      value={editData.amount}
                      onChange={(ev) =>
                        setEditData({ ...editData, amount: ev.target.value })
                      }
                    />
                    <input
                      value={editData.category}
                      onChange={(ev) =>
                        setEditData({ ...editData, category: ev.target.value })
                      }
                    />
                    <input
                      value={editData.description}
                      onChange={(ev) =>
                        setEditData({
                          ...editData,
                          description: ev.target.value,
                        })
                      }
                    />
                    <input
                      type="date"
                      value={editData.expense_date}
                      onChange={(ev) =>
                        setEditData({
                          ...editData,
                          expense_date: ev.target.value,
                        })
                      }
                    />
                    <div className="edit-actions">
                      <button onClick={saveEdit}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>₹{e.amount}</strong>
                      <span className="pill small">{e.category}</span>
                      <p className="desc">{e.description}</p>
                      <p style={{ fontSize: "12px", color: "#777" }}>
                        Spent on: {formatDate(e.expense_date)}
                      </p>
                    </div>

                    <div className="action-btns">
                      <button
                        className="edit-btn"
                        onClick={() => startEdit(e)}
                      >
                        ✏️ Edit
                      </button>

                      {deleteId === e.id ? (
                        <>
                          <button
                            className="confirm-btn"
                            onClick={() => deleteExpense(e.id)}
                          >
                            ✅ Confirm
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => setDeleteId(null)}
                          >
                            ❌ Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="delete-btn"
                          onClick={() => setDeleteId(e.id)}
                        >
                          🗑 Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default TripDetails;
