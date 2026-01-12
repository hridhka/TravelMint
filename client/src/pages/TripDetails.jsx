import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const fetchExpenses = useCallback(async () => {
    const res = await api.get(`/expenses/${id}`);
    setExpenses(res.data);
  }, [id]);

  const fetchSummary = useCallback(async () => {
    const res = await api.get(`/trips/${id}/summary`);
    setSummary(res.data);
  }, [id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchExpenses();
    fetchSummary();
  }, [fetchExpenses, fetchSummary]);

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

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>Trip Details</h2>

        {summary && (
          <div>
            <p>Budget: ₹{summary.budget}</p>
            <p>Total Spent: ₹{summary.totalSpent}</p>
            <p>Remaining: ₹{summary.remaining}</p>
            {summary.overBudget && (
              <p style={{ color: "red" }}>⚠ Over Budget!</p>
            )}
          </div>
        )}

        <form onSubmit={addExpense}>
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

        <h3>Expenses</h3>

        {expenses.length === 0 ? (
          <p>No expenses yet</p>
        ) : (
          <ul>
            {expenses.map((e) => (
              <li key={e.id}>
                ₹{e.amount} — {e.category} — {e.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default TripDetails;
