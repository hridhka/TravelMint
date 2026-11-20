
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import AddExpenseModal from "../components/AddExpenseModal";

import "./TripDetails.css";

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("expenses");

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all");

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

  const spent = summary ? Number(summary.totalSpent) || 0 : 0;
  const budgetTotal = summary ? Number(summary.budget) || 0 : 0;
  const remaining = summary ? Number(summary.remaining) || 0 : 0;

  const percentUsed =
    budgetTotal > 0 ? (spent / budgetTotal) * 100 : 0;

  const overBudget = budgetTotal > 0 && spent > budgetTotal;

  const expenseCategories = useMemo(
    () =>
      [
        ...new Set(
          expenses.map((expense) => expense.category || "Other")
        ),
      ].sort(),
    [expenses]
  );

  const groupedExpenses = useMemo(() => {
    const search = expenseSearch.trim().toLowerCase();
    const filtered = expenses.filter((expense) => {
      const matchesSearch =
        !search ||
        String(expense.description || "").toLowerCase().includes(search) ||
        String(expense.category || "").toLowerCase().includes(search) ||
        String(expense.amount || "").includes(search);

      const matchesCategory =
        expenseCategoryFilter === "all" ||
        (expense.category || "Other") === expenseCategoryFilter;

      return matchesSearch && matchesCategory;
    });

    const groups = filtered.reduce((result, expense) => {
      const dateKey = expense.expense_date
        ? String(expense.expense_date).split("T")[0]
        : "undated";

      if (!result[dateKey]) {
        result[dateKey] = [];
      }

      result[dateKey].push(expense);
      return result;
    }, {});

    return Object.entries(groups).sort(([dateA], [dateB]) => {
      if (dateA === "undated") return 1;
      if (dateB === "undated") return -1;
      return dateB.localeCompare(dateA);
    });
  }, [expenses, expenseSearch, expenseCategoryFilter]);

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

  const destinationPhotos = [
    {
      keywords: ["rajasthan", "jaipur", "udaipur", "jodhpur"],
      image:
        "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=2000&q=90",
      stamp: "RAJASTHAN",
    },
    {
      keywords: ["bali"],
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2000&q=90",
      stamp: "BALI",
    },
    {
      keywords: ["japan", "tokyo", "kyoto"],
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000&q=90",
      stamp: "JAPAN",
    },
    {
      keywords: ["paris", "france"],
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2000&q=90",
      stamp: "FRANCE",
    },
    {
      keywords: ["london"],
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=2000&q=90",
      stamp: "LONDON",
    },
    {
      keywords: ["manali", "himachal"],
      image:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=90",
      stamp: "HIMACHAL",
    },
  ];

  const destinationKey = String(summary?.title || "").toLowerCase();

  const destination = destinationPhotos.find((place) =>
    place.keywords.some((keyword) => destinationKey.includes(keyword))
  );

  const heroImage =
    destination?.image ||
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=90";

  const destinationStamp = destination?.stamp || "YOUR JOURNEY";

  const tripDuration = (() => {
    if (!summary?.start_date || !summary?.end_date) return null;

    const start = new Date(
      `${String(summary.start_date).split("T")[0]}T00:00:00`
    );
    const end = new Date(
      `${String(summary.end_date).split("T")[0]}T00:00:00`
    );

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    return Math.max(1, Math.round((end - start) / 86400000));
  })();

  const categoryBreakdown = useMemo(() => {
    const totals = expenses.reduce((result, expense) => {
      const name = expense.category?.trim() || "Other";
      result[name] = (result[name] || 0) + (Number(expense.amount) || 0);
      return result;
    }, {});

    const total = Object.values(totals).reduce(
      (sum, value) => sum + value,
      0
    );

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({
        name,
        value,
        percent: total > 0 ? (value / total) * 100 : 0,
        color: [
          "#315d43",
          "#d2ae70",
          "#91aa91",
          "#c88d72",
          "#9b9b79",
        ][index % 5],
      }));
  }, [expenses]);

  const dailyAvailable =
    tripDuration > 0
      ? Math.max(remaining, 0) / tripDuration
      : 0;

  const budgetPercent = Math.min(
    Math.max(percentUsed, 0),
    100
  );

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

            {/* DESTINATION HERO */}


            <section className="trip-hero trip-hero-map">
              <div className="trip-map-heading">
                <span className="trip-map-eyebrow">
                  THE JOURNEY, IN DETAIL
                </span>
                <h1>{summary?.title || "Your next adventure"}</h1>
                <p>
                  {formatDate(summary?.start_date)}
                  <span>—</span>
                  {formatDate(summary?.end_date)}
                  <span>·</span>
                  {tripDuration || "—"} {tripDuration === 1 ? "Day" : "Days"}
                </p>
              </div>

              <div className="trip-map-art" aria-hidden="true">
                <svg viewBox="0 0 900 330" role="presentation">
                  <defs>
                    <linearGradient id="mapGround" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#d9d4b5" />
                      <stop offset="100%" stopColor="#a6b28d" />
                    </linearGradient>
                    <linearGradient id="mapMountain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f4eee0" />
                      <stop offset="100%" stopColor="#82957b" />
                    </linearGradient>
                    <filter id="mapShadow" x="-30%" y="-30%" width="160%" height="180%">
                      <feDropShadow
                        dx="0"
                        dy="13"
                        stdDeviation="10"
                        floodColor="#394b36"
                        floodOpacity=".20"
                      />
                    </filter>
                  </defs>

                  <path
                    d="M95 190 L455 42 L812 185 L448 315 Z"
                    fill="url(#mapGround)"
                    stroke="#9ca88b"
                    strokeWidth="3"
                    filter="url(#mapShadow)"
                  />
                  <path d="M95 190 L95 207 L448 330 L448 315 Z" fill="#89977c" />
                  <path d="M448 315 L812 185 L812 202 L448 330 Z" fill="#75876d" />
                  <path
                    d="M145 190 L260 112 L360 177 L470 92 L590 174 L720 123 L780 185 L450 292 Z"
                    fill="#78916f"
                  />
                  <path
                    d="M165 190 L290 126 L375 182 L485 108 L590 182 L710 142 L760 188 L450 278 Z"
                    fill="#a8b58a"
                  />
                  <path d="M205 169 L310 55 L390 165 Z" fill="#7e8f80" />
                  <path
                    d="M270 100 L310 55 L340 101 L315 91 L300 109 Z"
                    fill="url(#mapMountain)"
                  />
                  <path d="M350 170 L470 34 L565 166 Z" fill="#748a7c" />
                  <path
                    d="M425 86 L470 34 L512 91 L478 77 L458 100 Z"
                    fill="url(#mapMountain)"
                  />
                  <path d="M510 166 L605 72 L690 175 Z" fill="#8b9c85" />
                  <path
                    d="M573 105 L605 72 L639 111 L608 99 L590 119 Z"
                    fill="#f3eee1"
                  />

                  <g fill="#456a4d">
                    <path d="M175 198 l12 -27 12 27z M195 211 l13 -29 13 29z M230 216 l12 -25 12 25z" />
                    <path d="M610 212 l13 -29 13 29z M638 204 l12 -25 12 25z M690 209 l13 -28 13 28z" />
                    <path d="M355 235 l12 -26 12 26z M385 249 l12 -27 12 27z M530 245 l12 -27 12 27z" />
                  </g>

                  <path
                    d="M225 205 C270 166 310 222 355 180 S440 130 475 174 S560 213 603 165 S680 151 717 180"
                    fill="none"
                    stroke="#f6e5b2"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="2 1"
                  />
                  <path
                    d="M225 205 C270 166 310 222 355 180 S440 130 475 174 S560 213 603 165 S680 151 717 180"
                    fill="none"
                    stroke="#fff9e9"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <g fill="#f8f0d9" stroke="#6e8065" strokeWidth="3">
                    <circle cx="225" cy="205" r="9" />
                    <circle cx="475" cy="174" r="9" />
                    <circle cx="603" cy="165" r="9" />
                    <circle cx="717" cy="180" r="9" />
                  </g>
                  <g fill="#31583f">
                    <circle cx="225" cy="205" r="3" />
                    <circle cx="475" cy="174" r="3" />
                    <circle cx="603" cy="165" r="3" />
                    <circle cx="717" cy="180" r="3" />
                  </g>
                </svg>
              </div>
              <span className="trip-map-stamp">T · M<br />TRAVEL JOURNAL</span>
            </section>

            {/* TRIP SECTION NAVIGATION */}

            <nav className="trip-tabs" aria-label="Trip sections">
              {[
                { id: "expenses", label: "Expenses", icon: "▧" },
                { id: "itinerary", label: "Itinerary", icon: "▦" },
                { id: "notes", label: "Notes", icon: "▤" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`trip-tab ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* ITINERARY PLACEHOLDER */}

            {activeTab === "itinerary" && (
              <section className="trip-feature-placeholder">
                <span className="section-eyebrow">YOUR TRAVEL PLAN</span>
                <h2>Your itinerary starts here.</h2>
                <p>
                  Your day-by-day travel plan will live here when itinerary
                  management is added to TravelMint.
                </p>
              </section>
            )}

            {/* NOTES PLACEHOLDER */}

            {activeTab === "notes" && (
              <section className="trip-feature-placeholder">
                <span className="section-eyebrow">YOUR TRAVEL JOURNAL</span>
                <h2>Keep a note of the little things.</h2>
                <p>
                  Travel notes, reminders and saved details will have their
                  own space here when notes functionality is added.
                </p>
              </section>
            )}

            {activeTab === "expenses" && (
              <section className="expenses-page-layout">
                <div className="ledger-panel">
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

            {/* TRANSACTION LIST */}

            <section className="expenses-section">
              <div className="ledger-heading">
                <div>
                  <span className="ledger-eyebrow">YOUR TRAVEL RECORD</span>
                  <h2>Trip Ledger</h2>
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
                  Add Expense
                </button>
              </div>

              <div className="ledger-toolbar">
                  <div className="expense-search">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m16 16 4 4" />
                    </svg>
                    <input
                      type="search"
                      placeholder="Search expenses..."
                      value={expenseSearch}
                      onChange={(event) =>
                        setExpenseSearch(event.target.value)
                      }
                      aria-label="Search expenses"
                    />
                  </div>

                  <select
                    className="expense-filter"
                    value={expenseCategoryFilter}
                    onChange={(event) =>
                      setExpenseCategoryFilter(event.target.value)
                    }
                    aria-label="Filter by category"
                  >
                    <option value="all">All categories</option>
                    {expenseCategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <span className="expense-count">
                    {groupedExpenses.reduce(
                      (total, [, dateExpenses]) =>
                        total + dateExpenses.length,
                      0
                    )}{" "}
                    entries
                  </span>
              </div>

              <div className="ledger-transactions">
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
                <div className="expense-timeline">
                  {groupedExpenses.length === 0 ? (
                    <p className="expense-no-results">
                      No expenses match your search or selected category.
                    </p>
                  ) : (
                    groupedExpenses.map(([dateKey, dateExpenses]) => (
                      <div className="expense-date-group" key={dateKey}>
                        <div className="expense-date-marker">
                          <span className="expense-date-pill">
                            {dateKey === "undated"
                              ? "No date"
                              : new Date(
                                  `${dateKey}T00:00:00`
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                          </span>
                          <span className="expense-timeline-dot" />
                        </div>

                        <div className="expense-date-items">
                          {dateExpenses.map((expense) => (
                            <article
                              className="expense-card"
                              key={expense.id}
                            >
                      {editingId === expense.id ? (
                        <form className="edit-box" onSubmit={saveEdit}>
                          <div className="edit-modal-header">
                            <div className="edit-modal-heading">
                              <div className="edit-modal-icon">
                                <span aria-hidden="true">✎</span>
                              </div>

                              <div>
                                <span className="edit-modal-eyebrow">
                                  YOUR TRAVEL JOURNAL
                                </span>
                                <h2>Edit Transaction</h2>
                                <p>Make changes to your travel expense.</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="edit-close"
                              onClick={cancelEdit}
                              aria-label="Cancel editing"
                              disabled={saving}
                            >
                              ×
                            </button>
                          </div>

                          <div className="edit-grid">
                            <label>
                              <span>Amount (₹)</span>
                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                required
                                placeholder="Enter amount"
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
                              <span>Category</span>
                              <input
                                required
                                maxLength={60}
                                placeholder="e.g. Food, Transport"
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
                              <span>Description</span>
                              <input
                                maxLength={200}
                                placeholder="Add a note about this expense"
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
                              <span>Date</span>
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

                          <div className="edit-modal-footer">
                            <span className="edit-secure-note">
                              ✦ Your journey, your records.
                            </span>

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
                                {saving ? "Saving…" : "Save Changes"}
                                {!saving}
                              </button>
                            </div>
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
                                    aria-label={
                                      deleting
                                        ? "Deleting expense"
                                        : "Confirm delete expense"
                                    }
                                    title="Confirm delete"
                                  >
                                    {deleting ? (
                                      "…"
                                    ) : (
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d="m5 12 4 4L19 6" />
                                      </svg>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setDeleteId(null)}
                                    disabled={deleting}
                                    aria-label="Cancel deletion"
                                    title="Cancel deletion"
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      aria-hidden="true"
                                    >
                                      <path d="m6 6 12 12M18 6 6 18" />
                                    </svg>
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
                      </div>
                    ))
                  )}
                </div>
              )}
              </div>
            </section>
                </div>

                <aside className="expense-insights-panel">
                  <div className="insights-heading">
                    <span className="ledger-eyebrow">YOUR TRIP FINANCES</span>
                    <h3>Budget Overview</h3>
                  </div>

                  <div
                    className="insights-donut"
                    style={{
                      background: `conic-gradient(
                        #4c8c68 0% ${budgetPercent}%,
                        #e9e3d2 ${budgetPercent}% 100%
                      )`
                    }}
                  >
                    <div className="insights-donut-inner">
                      <strong>{formatMoney(spent)}</strong>
                      <span>spent</span>
                      <small>of {formatMoney(budgetTotal)} budget</small>
                      <b>{budgetTotal > 0 ? `${Math.round(percentUsed)}%` : "—"}</b>
                    </div>
                  </div>

                  <div className="insights-stat-grid">
                    <div className="insights-stat">
                      <span>Available / day</span>
                      <strong>{tripDuration ? formatMoney(dailyAvailable) : "—"}</strong>
                      <small>Based on trip duration</small>
                    </div>

                    <div className="insights-stat">
                      <span>Remaining budget</span>
                      <strong className={overBudget ? "over-budget-text" : ""}>
                        {formatMoney(Math.abs(remaining))}
                      </strong>
                      <small>{overBudget ? "Over budget" : "Still available"}</small>
                    </div>
                  </div>

                  <div className="insights-category">
                    <div className="insights-category-heading">
                      <h4>Spend by Category</h4>
                      <span>{categoryBreakdown.length} categories</span>
                    </div>

                    {categoryBreakdown.length > 0 ? (
                      <div className="category-bars">
                        {categoryBreakdown.map((item) => (
                          <div className="category-bar-row" key={item.name}>
                            <div className="category-bar-label">
                              <span>
                                <i style={{ background: item.color }} />
                                {item.name}
                              </span>
                              <strong>{Math.round(item.percent)}%</strong>
                            </div>
                            <div className="category-bar-track">
                              <span
                                style={{
                                  width: `${item.percent}%`,
                                  background: item.color
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="category-empty">
                        Your category breakdown will appear here when you add expenses.
                      </p>
                    )}
                  </div>

                  <div className={`insights-budget-note ${overBudget ? "is-over" : ""}`}>
                    <span>{overBudget ? "!" : "✦"}</span>
                    <div>
                      <strong>
                        {overBudget ? "Budget exceeded" : "Travel within your means"}
                      </strong>
                      <p>
                        {budgetTotal <= 0
                          ? "Set a trip budget to start tracking your spending."
                          : overBudget
                            ? "Your spending has passed the planned trip budget."
                            : `${formatMoney(Math.max(remaining, 0))} is still available for your journey.`}
                      </p>
                    </div>
                  </div>
                </aside>
              </section>
            )}

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
