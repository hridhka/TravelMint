
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import AddExpenseModal from "../components/AddExpenseModal";

import "./TripDetails.css";

const CATEGORY_COLORS = [
  "#294c34",
  "#a8c5ad",
  "#f4d99b",
  "#f5ad8c",
  "#d8c5ef",
  "#8fb9cc",
  "#d5a8bd",
  "#b6b9a1",
];

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* =========================================
     FORMATTERS
  ========================================= */

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Date not set";

    const dateOnly = String(dateStr).split("T")[0];
    const parts = dateOnly.split("-");

    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      const parsed = new Date(year, month - 1, day);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }

    const parsed = new Date(dateStr);

    return Number.isNaN(parsed.getTime())
      ? "Date not set"
      : parsed.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  /* =========================================
     FETCH TRIP DATA
  ========================================= */

  const fetchExpenses = useCallback(async () => {
    const res = await api.get(`/expenses/${id}`);
    setExpenses(Array.isArray(res.data) ? res.data : []);
  }, [id]);

  const fetchSummary = useCallback(async () => {
    const res = await api.get(`/trips/${id}/summary`);
    setSummary(res.data);
  }, [id]);

  const refreshTripData = useCallback(async () => {
    await Promise.all([fetchExpenses(), fetchSummary()]);
  }, [fetchExpenses, fetchSummary]);

  useEffect(() => {
    let active = true;

    const loadTrip = async () => {
      setLoading(true);
      setPageError("");

      try {
        const [expenseRes, summaryRes] = await Promise.all([
          api.get(`/expenses/${id}`),
          api.get(`/trips/${id}/summary`),
        ]);

        if (!active) return;

        setExpenses(
          Array.isArray(expenseRes.data) ? expenseRes.data : []
        );
        setSummary(summaryRes.data);
      } catch (err) {
        console.error("TRIP DETAILS LOAD ERROR:", err);

        if (active) {
          setPageError(
            "We couldn't load this trip. Check your connection and try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTrip();

    return () => {
      active = false;
    };
  }, [id]);

  /* =========================================
     ADD EXPENSE
  ========================================= */

  const resetExpenseForm = () => {
    setAmount("");
    setCategory("");
    setDescription("");
    setDate("");
  };

  const addExpense = async (event) => {
    event.preventDefault();
    setActionError("");

    if (
      !amount ||
      Number(amount) <= 0 ||
      !category.trim() ||
      !date
    ) {
      setActionError("Enter a valid amount, category, and date.");
      return false;
    }

    setSaving(true);

    try {
      await api.post("/expenses", {
        trip_id: id,
        amount: Number(amount),
        category: category.trim(),
        description: description.trim(),
        expense_date: date,
      });

      resetExpenseForm();
      await refreshTripData();
      setOpenExpenseModal(false);

      return true;
    } catch (err) {
      console.error("ADD EXPENSE ERROR:", err);

      setActionError(
        err.response?.data?.message ||
          "Couldn't add this expense. Please try again."
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE EXPENSE
  ========================================= */

  const deleteExpense = async (expenseId) => {
    setActionError("");
    setDeleting(true);

    try {
      await api.delete(`/expenses/${expenseId}`);

      setDeleteId(null);

      if (editingId === expenseId) {
        setEditingId(null);
      }

      await refreshTripData();
    } catch (err) {
      console.error("DELETE EXPENSE ERROR:", err);

      setActionError(
        err.response?.data?.message ||
          "Couldn't delete this expense. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================
     EDIT EXPENSE
  ========================================= */

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setDeleteId(null);
    setActionError("");

    setEditData({
      amount: String(expense.amount ?? ""),
      category: expense.category ?? "",
      description: expense.description ?? "",
      expense_date: expense.expense_date?.split("T")[0] ?? "",
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setActionError("");

    if (
      !editData.amount ||
      Number(editData.amount) <= 0 ||
      !editData.category.trim() ||
      !editData.expense_date
    ) {
      setActionError("Enter a valid amount, category, and date.");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/expenses/${editingId}`, {
        ...editData,
        amount: Number(editData.amount),
        category: editData.category.trim(),
        description: editData.description.trim(),
      });

      setEditingId(null);
      await refreshTripData();
    } catch (err) {
      console.error("EDIT EXPENSE ERROR:", err);

      setActionError(
        err.response?.data?.message ||
          "Couldn't save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setActionError("");
  };

  /* =========================================
     SPENDING CALCULATIONS
  ========================================= */

  const categoryEntries = useMemo(() => {
    const totals = expenses.reduce((result, expense) => {
      const name = expense.category?.trim() || "Other";

      result[name] =
        (result[name] || 0) + (Number(expense.amount) || 0);

      return result;
    }, {});

    return Object.entries(totals).sort(
      (a, b) => b[1] - a[1]
    );
  }, [expenses]);

  const categoryGrandTotal = categoryEntries.reduce(
    (total, [, value]) => total + value,
    0
  );

  const spent = summary ? Number(summary.totalSpent) || 0 : 0;
  const budgetTotal = summary ? Number(summary.budget) || 0 : 0;
  const remaining = summary ? Number(summary.remaining) || 0 : 0;

  const percentUsed =
    budgetTotal > 0 ? (spent / budgetTotal) * 100 : 0;

  const overBudget = budgetTotal > 0 && spent > budgetTotal;

  const overspendPercent =
    budgetTotal > 0
      ? Math.round(((spent - budgetTotal) / budgetTotal) * 100)
      : 0;

  /*
   * Build a real donut gradient from actual expense categories.
   * A neutral full circle is used when there are no expenses.
   */

  const donutBackground = useMemo(() => {
    if (categoryGrandTotal <= 0) {
      return "conic-gradient(#e9ede5 0deg 360deg)";
    }

    let currentAngle = 0;

    const segments = categoryEntries.map(([, total], index) => {
      const angle = (total / categoryGrandTotal) * 360;
      const start = currentAngle;
      const end = currentAngle + angle;

      currentAngle = end;

      return `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [categoryEntries, categoryGrandTotal]);

  /* =========================================
     CATEGORY ICONS
  ========================================= */

  const getCategoryIcon = (name) => {
    const value = String(name || "").toLowerCase();

    if (/food|dining|restaurant|cafe|drink/.test(value)) {
      return "🍽";
    }

    if (/transport|flight|travel|taxi|train|bus/.test(value)) {
      return "↗";
    }

    if (/hotel|stay|accommodation|lodging/.test(value)) {
      return "⌂";
    }

    if (/shopping|souvenir|clothing/.test(value)) {
      return "◇";
    }

    if (/activity|entertainment|museum|tour|ticket/.test(value)) {
      return "✳";
    }

    if (/health|medical|pharmacy/.test(value)) {
      return "＋";
    }

    return "•";
  };

  const heroImage =
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85";

  /* =========================================
     PAGE
  ========================================= */

  return (
    <>
      <Navbar />

      <main className="trip-container">
        {loading ? (
          <div className="trip-loading" role="status">
            <span className="loading-mark" />
            <p>Gathering your travel details…</p>
          </div>
        ) : pageError ? (
          <section className="trip-state">
            <span className="state-eyebrow">TRAVELMINT</span>
            <h1>One moment, traveller.</h1>
            <p>{pageError}</p>

            <button
              type="button"
              className="open-modal-btn"
              onClick={async () => {
                setLoading(true);
                setPageError("");

                try {
                  await refreshTripData();
                } catch (err) {
                  console.error(err);
                  setPageError(
                    "Still unable to load this trip. Please try again."
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              Try again
            </button>
          </section>
        ) : (
          <>
            {/* TRIP BREADCRUMB */}

            <div className="trip-breadcrumb">
              <button
                type="button"
                className="back-dashboard-btn"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>

              <span className="breadcrumb-divider">/</span>

              <span>{summary?.title || "Trip details"}</span>
            </div>

            {/* TRIP HERO */}

            <section className="trip-hero">
              <img
                src={heroImage}
                alt=""
                fetchPriority="high"
              />

              <div className="trip-hero-shade" />

              <div className="hero-overlay">
                <span className="hero-kicker">
                  THE JOURNEY, IN DETAIL
                </span>

                <h1>{summary?.title || "Your next adventure"}</h1>

                <p>
                  <span aria-hidden="true">↗</span>
                  {formatDate(summary?.start_date)}
                  <span className="hero-date-divider">—</span>
                  {formatDate(summary?.end_date)}
                </p>
              </div>

              <div className="hero-index" aria-hidden="true">
                TM / 01
              </div>
            </section>

            {/* OVERALL TRIP BUDGET */}

            {summary && (
              <section
                className="budget-card"
                aria-label="Trip budget summary"
              >
                <div className="budget-top">
                  <div>
                    <span className="section-eyebrow">
                      YOUR TRIP FINANCES
                    </span>
                    <h2>Spend thoughtfully.</h2>
                  </div>

                  <div
                    className={`budget-status ${
                      overBudget ? "danger" : "success"
                    }`}
                  >
                    <span className="budget-status-dot" />
                    {overBudget ? "Over budget" : "Within budget"}
                  </div>
                </div>

                <div className="budget-metrics">
                  <div className="budget-metric budget-metric-primary">
                    <span>Total spent</span>
                    <strong>{formatMoney(spent)}</strong>
                  </div>

                  <div className="budget-metric">
                    <span>
                      {overBudget ? "Over budget by" : "Still available"}
                    </span>

                    <strong className={overBudget ? "danger" : "success"}>
                      {formatMoney(Math.abs(remaining))}
                    </strong>
                  </div>

                  <div className="budget-metric">
                    <span>Total budget</span>
                    <strong>{formatMoney(budgetTotal)}</strong>
                  </div>
                </div>

                <div className="budget-progress-heading">
                  <span>Budget used</span>
                  <strong>
                    {budgetTotal > 0
                      ? `${Math.round(percentUsed)}%`
                      : "No budget set"}
                  </strong>
                </div>

                <div
                  className="budget-bar"
                  role="progressbar"
                  aria-label="Trip budget used"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(
                    Math.round(percentUsed),
                    100
                  )}
                >
                  <div
                    className={`budget-fill ${
                      overBudget ? "danger" : "success"
                    }`}
                    style={{
                      width: `${Math.min(percentUsed, 100)}%`,
                    }}
                  />
                </div>

                <p className="budget-footer">
                  {budgetTotal > 0
                    ? overBudget
                      ? "You've spent more than planned. Review your expenses below."
                      : "A clear view of your spending keeps your journey on track."
                    : "Add a budget to start tracking your spending."}
                </p>
              </section>
            )}

            {/* YOUR EXPENSES HEADER */}

            <section className="expense-toolbar">
              <div>
                <span className="section-eyebrow">THE DETAILS</span>

                <h2>
                  Your expenses
                  <span className="heading-period">.</span>
                </h2>

                <p>Every little detail, accounted for.</p>
              </div>

              <button
                type="button"
                className="toolbar-add-btn"
                onClick={() => {
                  setActionError("");
                  setOpenExpenseModal(true);
                }}
              >
                <span aria-hidden="true">＋</span>
                Add expense
              </button>
            </section>

            {/* ACTION ERRORS */}

            {actionError && !openExpenseModal && (
              <div className="trip-action-error" role="alert">
                <span>{actionError}</span>

                <button
                  type="button"
                  onClick={() => setActionError("")}
                  aria-label="Dismiss message"
                >
                  ×
                </button>
              </div>
            )}

            {/* DONUT SUMMARY — NO SEPARATE CATEGORY CARDS */}

            <section
              className="expense-summary-card"
              aria-label="Expense summary by category"
            >
              <div className="expense-summary-main">
                {/* DONUT CHART */}

                <div className="expense-donut-panel">
                  <div
                    className="expense-donut"
                    style={{ background: donutBackground }}
                    role="img"
                    aria-label={`Total spent ${formatMoney(
                      spent
                    )}, budget ${formatMoney(
                      budgetTotal
                    )}, ${Math.round(percentUsed)} percent used`}
                  >
                    <div className="expense-donut-center">
                      <strong>{formatMoney(spent)}</strong>

                      <span>Total spent</span>

                      <small>
                        of {formatMoney(budgetTotal)} budget
                      </small>

                      <span className="expense-total-percent">
                        {budgetTotal > 0
                          ? `${Math.round(percentUsed)}%`
                          : "No budget"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CATEGORY LEGEND */}

                <div className="expense-summary-legend">
                  {categoryEntries.length > 0 ? (
                    categoryEntries.map(([name, total], index) => {
                      const share =
                        categoryGrandTotal > 0
                          ? (total / categoryGrandTotal) * 100
                          : 0;

                      return (
                        <div className="expense-legend-item" key={name}>
                          <span
                            className="expense-legend-dot"
                            style={{
                              background:
                                CATEGORY_COLORS[
                                  index % CATEGORY_COLORS.length
                                ],
                            }}
                            aria-hidden="true"
                          />

                          <span className="expense-legend-name">
                            {name}
                          </span>

                          <span className="expense-legend-amount">
                            {formatMoney(total)}
                          </span>

                          <span className="expense-legend-percent">
                            {Math.round(share)}%
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="expense-empty-legend">
                      Your category breakdown will appear here after you
                      add your first expense.
                    </p>
                  )}
                </div>
              </div>

              {/* BUDGET ALERT */}

              <div
                className={`expense-budget-alert ${
                  !overBudget ? "within-budget" : ""
                }`}
                role="status"
              >
                <span
                  className="expense-budget-alert-icon"
                  aria-hidden="true"
                >
                  {overBudget ? "!" : "✓"}
                </span>

                <div className="expense-budget-alert-copy">
                  <strong>
                    {overBudget
                      ? "You've spent more than planned."
                      : "Your trip budget is on track."}
                  </strong>

                  <p>
                    {budgetTotal <= 0
                      ? "Set a trip budget to track your spending."
                      : overBudget
                        ? `Total expenses are ${overspendPercent}% over your ${formatMoney(
                            budgetTotal
                          )} budget.`
                        : `${formatMoney(
                            Math.max(remaining, 0)
                          )} remaining from your ${formatMoney(
                            budgetTotal
                          )} budget.`}
                  </p>
                </div>
              </div>
            </section>

            {/* TRANSACTION LIST */}

            <section className="expenses-section">
              <div className="section-heading-row expense-section-heading">
                <div>
                  <span className="section-eyebrow">
                    YOUR TRAVEL LEDGER
                  </span>

                  <h3>All transactions</h3>
                </div>

                <span className="expense-count">
                  {expenses.length}{" "}
                  {expenses.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {expenses.length === 0 ? (
                <div className="expense-empty">
                  <span className="empty-symbol" aria-hidden="true">
                    ＋
                  </span>

                  <h4>A fresh page.</h4>

                  <p>
                    Your trip has no expenses yet. Add your first one to
                    start tracking your travel budget.
                  </p>

                  <button
                    type="button"
                    className="empty-add-btn"
                    onClick={() => {
                      setActionError("");
                      setOpenExpenseModal(true);
                    }}
                  >
                    Add your first expense
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              ) : (
                <div className="expense-list">
                  {expenses.map((expense) => (
                    <article
                      className="expense-card"
                      key={expense.id}
                    >
                      {editingId === expense.id ? (
                        <form className="edit-box" onSubmit={saveEdit}>
                          <div className="edit-heading">
                            <span className="section-eyebrow">
                              EDIT TRANSACTION
                            </span>

                            <button
                              type="button"
                              className="edit-close"
                              onClick={cancelEdit}
                              aria-label="Cancel editing"
                            >
                              ×
                            </button>
                          </div>

                          <div className="edit-grid">
                            <label>
                              Amount (₹)
                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                required
                                value={editData.amount}
                                onChange={(event) =>
                                  setEditData({
                                    ...editData,
                                    amount: event.target.value,
                                  })
                                }
                              />
                            </label>

                            <label>
                              Category
                              <input
                                required
                                maxLength={60}
                                value={editData.category}
                                onChange={(event) =>
                                  setEditData({
                                    ...editData,
                                    category: event.target.value,
                                  })
                                }
                              />
                            </label>

                            <label className="edit-description">
                              Description
                              <input
                                maxLength={200}
                                value={editData.description}
                                onChange={(event) =>
                                  setEditData({
                                    ...editData,
                                    description: event.target.value,
                                  })
                                }
                              />
                            </label>

                            <label>
                              Date
                              <input
                                type="date"
                                required
                                value={editData.expense_date}
                                onChange={(event) =>
                                  setEditData({
                                    ...editData,
                                    expense_date: event.target.value,
                                  })
                                }
                              />
                            </label>
                          </div>

                          <div className="edit-actions">
                            <button
                              type="button"
                              className="cancel-btn"
                              onClick={cancelEdit}
                              disabled={saving}
                            >
                              Cancel
                            </button>

                            <button
                              type="submit"
                              className="save-btn"
                              disabled={saving}
                            >
                              {saving ? "Saving…" : "Save changes"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="expense-left">
                            <div
                              className="expense-icon"
                              aria-hidden="true"
                            >
                              {getCategoryIcon(expense.category)}
                            </div>

                            <div className="expense-description">
                              <strong>
                                {expense.description || expense.category}
                              </strong>

                              <p className="expense-meta">
                                <span>
                                  {formatDate(expense.expense_date)}
                                </span>

                                <span className="meta-dot">·</span>

                                <span>
                                  {expense.category || "Other"}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="expense-right">
                            <strong className="expense-amount">
                              {formatMoney(expense.amount)}
                            </strong>

                            <div className="action-btns">
                              <button
                                type="button"
                                className="edit-btn"
                                onClick={() => startEdit(expense)}
                                aria-label={`Edit expense ${
                                  expense.description || expense.category
                                }`}
                                title="Edit expense"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="m14 5 5 5" />
                                  <path d="M4 20l4.5-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" />
                                </svg>
                              </button>

                              {deleteId === expense.id ? (
                                <div className="delete-confirm">
                                  <span>Delete?</span>

                                  <button
                                    type="button"
                                    className="confirm-btn"
                                    onClick={() =>
                                      deleteExpense(expense.id)
                                    }
                                    disabled={deleting}
                                  >
                                    {deleting ? "…" : "Yes"}
                                  </button>

                                  <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setDeleteId(null)}
                                    disabled={deleting}
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="delete-btn"
                                  onClick={() => {
                                    setDeleteId(expense.id);
                                    setActionError("");
                                  }}
                                  aria-label={`Delete expense ${
                                    expense.description || expense.category
                                  }`}
                                  title="Delete expense"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="m19 6-1 14H6L5 6" />
                                    <path d="M10 11v5M14 11v5" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* FOOTER */}

            <footer className="trip-details-footer">
              <span>TRAVELMINT</span>
              <span>Travel well. Spend thoughtfully.</span>
            </footer>
          </>
        )}
      </main>

      {/* ADD EXPENSE MODAL */}

      <AddExpenseModal
        isOpen={openExpenseModal}
        onClose={() => {
          if (!saving) {
            setOpenExpenseModal(false);
            setActionError("");
          }
        }}
        onSubmit={addExpense}
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        description={description}
        setDescription={setDescription}
        date={date}
        setDate={setDate}
      />

      {openExpenseModal && actionError && (
        <div className="expense-modal-error" role="alert">
          {actionError}
        </div>
      )}
    </>
  );
}

export default TripDetails;
