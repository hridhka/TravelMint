import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import AddExpenseModal from "../components/AddExpenseModal";
import "./TripDetails.css";

function TripDetails() {
  const { id } = useParams();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [openExpenseModal, setOpenExpenseModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    amount: "",
    category: "",
    description: "",
    expense_date: "",
  });

  const [deleteId, setDeleteId] = useState(null);

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
    setDeleteId(null);
    fetchExpenses();
    fetchSummary();
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setEditData({
      amount: e.amount,
      category: e.category,
      description: e.description,
      expense_date: e.expense_date?.split("T")[0],
    });
  };

  const saveEdit = async () => {
    await api.put(`/expenses/${editingId}`, editData);
    setEditingId(null);
    fetchExpenses();
    fetchSummary();
  };

  const cancelEdit = () => setEditingId(null);

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  const spent = summary ? Number(summary.totalSpent) : 0;
  const budgetTotal = summary ? Number(summary.budget) : 0;
  const remaining = summary ? Number(summary.remaining) : 0;
  const percentUsed =
    budgetTotal > 0 ? Math.min((spent / budgetTotal) * 100, 100) : 0;

  const heroImage = `https://picsum.photos/1200/500?random=${id}`;

  const getCategoryIcon = (category) => {
    const map = {
      shopping: "🛍️",
      food: "🍽️",
      dining: "🍽️",
      transport: "✈️",
      travel: "✈️",
      accommodation: "🏨",
      hotel: "🏨",
      activities: "🎯",
      entertainment: "🎉",
    };
    return map[category?.toLowerCase()] || "💸";
  };

  return (
    <>
      <Navbar />

      <div className="trip-container">
        <div className="trip-hero">
          <img src={heroImage} alt="Trip cover" />
          <div className="hero-overlay">
            <h1>{summary?.title}</h1>
            <p>
              {formatDate(summary?.start_date)} →{" "}
              {formatDate(summary?.end_date)}
            </p>
          </div>
        </div>

        {summary && (
          <div className="budget-card">
            <div className="budget-row">
              <span>₹{spent.toLocaleString()} spent</span>
              <span className={remaining < 0 ? "danger" : "success"}>
                ₹{remaining.toLocaleString()} left
              </span>
            </div>

            <div className="budget-bar">
              <div
                className={`budget-fill ${
                  remaining < 0 ? "danger" : "success"
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>

            <div className="budget-footer">
              Budget: ₹{budgetTotal.toLocaleString()}
            </div>
          </div>
        )}

        <button
          className="open-modal-btn"
          onClick={() => setOpenExpenseModal(true)}
        >
          + Add Expense
        </button>

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
                  <div className="expense-left">
                    <div className="icon">{getCategoryIcon(e.category)}</div>
                    <div>
                      <strong>{e.description}</strong>
                      <p className="meta">
                        {formatDate(e.expense_date)} • {e.category}
                      </p>
                    </div>
                  </div>

                  <div className="expense-right">
                    <strong>₹{e.amount}</strong>

                    <div className="action-btns">
                      <button
                        className="edit-btn"
                        onClick={() => startEdit(e)}
                      >
                        ✎
                      </button>

                      {deleteId === e.id ? (
                        <>
                          <button
                            className="confirm-btn"
                            onClick={() => deleteExpense(e.id)}
                          >
                            ✓
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => setDeleteId(null)}
                          >
                            ✘
                            
                        
                          </button>
                        </>
                      ) : (
                        <button
                          className="delete-btn"
                          onClick={() => setDeleteId(e.id)}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <AddExpenseModal
        isOpen={openExpenseModal}
        onClose={() => setOpenExpenseModal(false)}
        onSubmit={(e) => {
          addExpense(e);
          setOpenExpenseModal(false);
        }}
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        description={description}
        setDescription={setDescription}
        date={date}
        setDate={setDate}
      />
    </>
  );
}

export default TripDetails;
