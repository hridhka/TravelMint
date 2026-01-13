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

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, [id]);

  const fetchExpenses = async () => {
    const res = await api.get(`/expenses/${id}`);
    setExpenses(res.data);
  };

  const fetchSummary = async () => {
    const res = await api.get(`/trips/${id}/summary`);
    setSummary(res.data);
  };

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

  const deleteExpense = async (expenseId) => {
    await api.delete(`/expenses/${expenseId}`);
    fetchExpenses();
    fetchSummary();
  };

  // 📊 total by category
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Trip Details</h2>

        {/* 🔴 Budget summary */}
        {summary && (
          <div
            style={{
              padding: "16px",
              background: "#fff",
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
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
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

        {/* 📊 Category totals */}
        {Object.keys(categoryTotals).length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h4>Spent by Category</h4>
            {Object.entries(categoryTotals).map(([cat, total]) => (
              <span
                key={cat}
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: "14px",
                  background: "#eef2ff",
                  marginRight: "8px",
                  marginTop: "6px",
                  fontSize: "14px",
                }}
              >
                {cat}: ₹{total}
              </span>
            ))}
          </div>
        )}

        {/* 📜 Expense list */}
        <h3>Expenses</h3>

        {expenses.length === 0 ? (
          <p>No expenses yet</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {expenses.map((e) => (
              <li
                key={e.id}
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#fff",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>₹{e.amount}</strong>{" "}
                  <span
                    style={{
                      background: "#e0e7ff",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      marginLeft: "6px",
                    }}
                  >
                    {e.category}
                  </span>
                  <div style={{ fontSize: "14px", color: "#555" }}>
                    {e.description}
                  </div>
                </div>

                <button
                  onClick={() => deleteExpense(e.id)}
                  style={{
                    background: "#dc2626",
                    color: "#fff",
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
