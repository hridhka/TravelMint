import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";

function TripDetails() {
  const { id } = useParams();

  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const fetchExpenses = async () => {
    const res = await api.get(`/expenses/${id}`);
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, [id]);

  const addExpense = async (e) => {
    e.preventDefault();
    try {
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
    } catch {
      alert("Add expense failed");
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      fetchExpenses();
    } catch {
      alert("Delete failed");
    }
  };

  const updateExpense = async (expense) => {
    const newAmount = prompt("New amount:", expense.amount);
    if (!newAmount) return;

    await api.put(`/expenses/${expense.id}`, {
      amount: newAmount,
      category: expense.category,
      description: expense.description,
      expense_date: expense.expense_date,
    });

    fetchExpenses();
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
        <h2>Trip Details</h2>

        <form onSubmit={addExpense}>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <button>Add Expense</button>
        </form>

        <ul>
          {expenses.map((e) => (
            <li key={e.id}>
              ₹{e.amount} — {e.category}
              <button onClick={() => updateExpense(e)}>✏️ Edit</button>
              <button onClick={() => deleteExpense(e.id)}>🗑 Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default TripDetails;
