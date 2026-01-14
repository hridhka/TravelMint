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

  // ✏️ edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

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

  // 🔴 CONFIRM DELETE
  const deleteExpense = async (expenseId) => {
    const ok = window.confirm("Are you sure you want to delete this expense?");
    if (!ok) return;

    try {
      await api.delete(`/expenses/${expenseId}`);
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Delete failed");
    }
  };

  // ✏️ START EDIT
  const startEdit = (expense) => {
    setEditingId(expense.id);
    setEditData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      expense_date: expense.expense_date,
    });
  };

  // 💾 SAVE EDIT
  const saveEdit = async (expenseId) => {
    try {
      await api.put(`/expenses/${expenseId}`, editData);
      setEditingId(null);
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      console.error("EDIT ERROR:", err);
      alert("Update failed");
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        <h2>Trip Details</h2>

        {/* 🔴 Budget summary */}
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

        <h3 style={{ marginTop: "20px" }}>Expenses</h3>

        {expenses.map((e) => (
          <div
            key={e.id}
            style={{
              border: "1px solid #ddd",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {editingId === e.id ? (
              <>
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
                    setEditData({ ...editData, description: ev.target.value })
                  }
                />

                <button onClick={() => saveEdit(e.id)}>💾 Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <div>
                  <strong>₹{e.amount}</strong> — {e.category}
                  <div>{e.description}</div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => startEdit(e)}>✏️</button>
                  <button
                    onClick={() => deleteExpense(e.id)}
                    style={{ background: "#dc2626", color: "#fff" }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default TripDetails;
