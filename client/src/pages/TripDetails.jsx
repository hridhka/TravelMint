import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";

function TripDetails() {
  const { id } = useParams();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  // ======================
  // FETCH DATA
  // ======================

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

  // ======================
  // ADD EXPENSE
  // ======================

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

  // ======================
  // DELETE EXPENSE ✅
  // ======================

const deleteExpense = async (expenseId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this expense?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/expenses/${expenseId}`);
    fetchExpenses();
    fetchSummary();
  } catch (err) {
    console.error("DELETE ERROR:", err.response?.data || err.message);
    alert("Delete failed");
  }
};


  // ======================
  // CATEGORY TOTALS
  // ======================

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        <h2>Trip Details</h2>

        {/* 🔴 Budget Summary */}
        {summary && (
          <div
            style={{
              padding: "16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "20px",
              color: summary.overBudget ? "#dc2626" : "#111",
            }}
          >
            <p>Budget: ₹{summary.budget}</p>
            <p>Total Spent: ₹{summary.totalSpent}</p>
            <p>
              Remaining: ₹{summary.remaining}{" "}
              {summary.overBudget && "⚠ Over Budget"}
            </p>
          </div>
        )}

        {/* ➕ Add Expense */}
        <form
          onSubmit={addExpense}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
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

        {/* 📊 Category Totals */}
        {Object.keys(categoryTotals).length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h4>Spent by Category</h4>
            {Object.entries(categoryTotals).map(([cat, total]) => (
              <span
                key={cat}
                style={{
                  display: "inline-block",
                  marginRight: "8px",
                  background: "#eef2ff",
                  padding: "6px 10px",
                  borderRadius: "14px",
                }}
              >
                {cat}: ₹{total}
              </span>
            ))}
          </div>
        )}

        {/* 📜 Expenses */}
        <h3 style={{ marginTop: "30px" }}>Expenses</h3>

        {expenses.length === 0 ? (
          <p>No expenses yet</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {expenses.map((e) => (
              <li
                key={e.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <strong>₹{e.amount}</strong>
                  <span
                    style={{
                      marginLeft: "8px",
                      background: "#e0e7ff",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    {e.category}
                  </span>
                  <div style={{ fontSize: "14px", color: "#555" }}>
                    {e.description}
                  </div>
                </div>

                {/* ✅ DELETE BUTTON */}
                <button onClick={() => deleteExpense(e.id)}
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default TripDetails;
