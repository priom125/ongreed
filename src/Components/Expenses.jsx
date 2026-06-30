import { useState, useMemo } from "react";

// ── Category styling ─────────────────────────────────────────
const categoryStyle = {
  "Facebook Ads":   "bg-indigo-50 text-indigo-600",
  "Courier Charge": "bg-blue-50 text-blue-600",
  "Packaging":      "bg-amber-50 text-amber-600",
  "Cost of Goods":  "bg-violet-50 text-violet-600",
  "Others":         "bg-emerald-50 text-emerald-600",
};
const categoryColors = {
  "Cost of Goods":  "#6366f1",
  "Facebook Ads":   "#8b5cf6",
  "Courier Charge": "#3b82f6",
  "Packaging":      "#f59e0b",
  "Others":         "#10b981",
};
const categoryList = Object.keys(categoryStyle);
const paymentMethods = ["Cash", "bKash", "Nagad", "Bank Transfer", "Card"];

// ── Initial expense data ─────────────────────────────────────
const initialExpenses = [
  { id: 1, date: "2024-05-26", category: "Facebook Ads",  desc: "Meta Ads Campaign - Jersey", amount: 5600,  method: "bKash",        by: "Priom Sheikh" },
  { id: 2, date: "2024-05-26", category: "Courier Charge", desc: "Pathao Courier Charge",      amount: 1250,  method: "Cash",         by: "Priom Sheikh" },
  { id: 3, date: "2024-05-25", category: "Packaging",      desc: "Packaging Materials",        amount: 840,   method: "Cash",         by: "Priom Sheikh" },
  { id: 4, date: "2024-05-25", category: "Cost of Goods",  desc: "Argentina Home Jersey Stock",amount: 52000, method: "Bank Transfer",by: "Priom Sheikh" },
  { id: 5, date: "2024-05-24", category: "Others",         desc: "Office Supplies",            amount: 560,   method: "Cash",         by: "Priom Sheikh" },
  { id: 6, date: "2024-05-24", category: "Facebook Ads",  desc: "Meta Ads Campaign - T-Shirt",amount: 8200,  method: "bKash",        by: "Priom Sheikh" },
  { id: 7, date: "2024-05-23", category: "Courier Charge", desc: "RedX Courier Charge",        amount: 1100,  method: "Cash",         by: "Priom Sheikh" },
  { id: 8, date: "2024-05-23", category: "Packaging",      desc: "Poly Bag, Sticker, Invoice", amount: 1400,  method: "Cash",         by: "Priom Sheikh" },
];

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Donut chart ───────────────────────────────────────────────
function Donut({ segments, total, label, size = 170, stroke = 26 }) {
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  if (segments.length === 0) {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="19" fontWeight="700" fill="#1e293b">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#94a3b8">{label}</text>
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="19" fontWeight="700" fill="#1e293b">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#94a3b8">{label}</text>
    </svg>
  );
}

function CategoryBars({ data, max }) {
  const ticks = [0, max * 0.25, max * 0.5, max * 0.75, max].map((n) => Math.round(n));
  return (
    <div>
      <div className="space-y-4">
        {data.map((c) => (
          <div key={c.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-28 flex-shrink-0">{c.label}</span>
            <div className="flex-1 h-3 bg-gray-50 rounded-full relative overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{ width: `${max ? (c.amount / max) * 100 : 0}%`, background: c.color }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-16 text-right flex-shrink-0">৳ {c.amount.toLocaleString()}</span>
            <span className="text-xs text-gray-400 w-12 text-right flex-shrink-0">({c.pct}%)</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3 pl-[7.5rem] text-[10px] text-gray-300 border-t border-gray-50 pt-2">
        {ticks.map((t, i) => <span key={i}>{t === 0 ? "0" : `${Math.round(t / 1000)}k`}</span>)}
      </div>
    </div>
  );
}

// ── Add / Edit Expense Modal ─────────────────────────────────
function ExpenseModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial || { date: new Date().toISOString().slice(0, 10), category: categoryList[0], desc: "", amount: "", method: paymentMethods[0], by: "Priom Sheikh" }
  );
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    
    const amt = parseFloat(form.amount);
    if (!form.date || !form.desc.trim() || isNaN(amt) || amt <= 0) {
      setError("Please fill in name/description, date, and a valid amount.");
      return;
    }
    console.log("Saving expense:", form);
    fetch("http://localhost:3000/expense", { method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form) })
      .then((res) => res.json())
      .then((data) => {
        console.log("Expense saved:", data);
        onSave(data);
      })
      .catch((err) => {
        console.error("Error saving expense:", err);
        setError("Failed to save expense.");
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">{initial ? "Edit Expense" : "Add Expense"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Expense Name / Description</label>
            <input
              type="text"
              placeholder="e.g. Meta Ads Campaign"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Amount (৳)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9.]/g, "") })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white"
              >
                {categoryList.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Payment Method</label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white"
              >
                {paymentMethods.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2">
              Cancel
            </button>
            <button type="submit" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-5 py-2 transition-colors">
              {initial ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Date range picker dropdown ───────────────────────────────
function DateRangeDropdown({ range, onApply, onClose }) {
  const [start, setStart] = useState(range.start);
  const [end, setEnd] = useState(range.end);
  return (
    <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-100 rounded-xl shadow-lg p-4 w-72" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Start date</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">End date</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
          <button onClick={() => onApply(start, end)} className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5">Apply</button>
        </div>
      </div>
    </div>
  );
}

// ── Filters dropdown ──────────────────────────────────────────
function FiltersDropdown({ filters, onChange, onClose, onReset }) {
  return (
    <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-100 rounded-xl shadow-lg p-4 w-64" onClick={(e) => e.stopPropagation()}>
      <p className="text-xs font-semibold text-gray-700 mb-3">Filter Expenses</p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="Category">All Categories</option>
            {categoryList.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Payment Method</label>
          <select
            value={filters.method}
            onChange={(e) => onChange({ ...filters, method: e.target.value })}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="All">All Methods</option>
            {paymentMethods.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex justify-between pt-1">
          <button onClick={onReset} className="text-xs font-medium text-gray-500 hover:text-gray-700">Reset</button>
          <button onClick={onClose} className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5">Done</button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

function normalizeExpense(expense) {
  return {
    id: expense?.id ?? Date.now(),
    date: expense?.date ?? new Date().toISOString().slice(0, 10),
    category: expense?.category ?? "Others",
    desc: expense?.desc ?? expense?.description ?? "",
    amount: Number(expense?.amount ?? 0),
    method: expense?.method ?? "Cash",
    by: expense?.by ?? "Priom Sheikh",
  };
}

export default function Expenses() {
  const [expenses, setExpenses] = useState(initialExpenses.map(normalizeExpense));
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "Category", method: "All" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openMenu, setOpenMenu] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "2024-05-20", end: "2024-05-26" });

  const normalizedExpenses = useMemo(() => expenses.map(normalizeExpense), [expenses]);

  // ── Derived: filtered + sorted list ──
  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return normalizedExpenses
      .filter((e) => {
        const matchesSearch =
          e.desc.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query);
        const matchesCategory = filters.category === "Category" || e.category === filters.category;
        const matchesMethod = filters.method === "All" || e.method === filters.method;
        return matchesSearch && matchesCategory && matchesMethod;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [normalizedExpenses, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── Derived: stats ──
  const totalExpenses = normalizedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const thisWeekTotal = normalizedExpenses
    .filter((e) => e.date >= dateRange.start && e.date <= dateRange.end)
    .reduce((sum, e) => sum + e.amount, 0);
  const avgDaily = Math.round(thisWeekTotal / 7);
  const uniqueCategories = new Set(normalizedExpenses.map((e) => e.category)).size;

  const categoryTotals = useMemo(() => {
    const map = {};
    normalizedExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map)
      .map(([label, amount]) => ({
        label, amount, pct: +((amount / total) * 100).toFixed(1), color: categoryColors[label] || "#94a3b8",
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const maxCategoryAmount = Math.max(...categoryTotals.map((c) => c.amount), 1);

  const stats = [
    {
      label: "Total Expenses", value: `৳ ${totalExpenses.toLocaleString()}`, change: "12.4%", up: false,
      color: "bg-violet-50", iconColor: "text-violet-500",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>,
    },
    {
      label: "This Week", value: `৳ ${thisWeekTotal.toLocaleString()}`, change: "8.6%", up: false,
      color: "bg-sky-50", iconColor: "text-sky-500",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      label: "This Month", value: `৳ ${totalExpenses.toLocaleString()}`, change: "15.2%", up: true,
      color: "bg-emerald-50", iconColor: "text-emerald-500",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4" /></svg>,
    },
    {
      label: "Average Daily", value: `৳ ${avgDaily.toLocaleString()}`, note: "based on this week",
      color: "bg-amber-50", iconColor: "text-amber-500",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>,
    },
    {
      label: "Categories", value: String(uniqueCategories), note: "expense categories",
      color: "bg-rose-50", iconColor: "text-rose-400",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M20.59 13.41L13.42 20.58a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><circle cx="7" cy="7" r="1.5" /></svg>,
    },
  ];

  // ── Handlers ──
  const handleAdd = (data) => {
    setExpenses((prev) => [normalizeExpense({ id: Date.now(), by: "Priom Sheikh", ...data }), ...prev]);
    setShowAddModal(false);
    setPage(1);
  };

  const handleEdit = (data) => {
    setExpenses((prev) => prev.map((e) => (e.id === editTarget.id ? normalizeExpense({ ...e, ...data }) : e)));
    setEditTarget(null);
  };

  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setOpenMenu(null);
  };

  const resetFilters = () => { setFilters({ category: "Category", method: "All" }); setPage(1); };

  return (
    <div className="bg-gray-50 min-h-screen font-sans" onClick={() => { setOpenMenu(null); setShowDatePicker(false); setShowFilters(false); }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track and manage all your business expenses</p>
        </div>
        <div className="flex items-center gap-2">

          {/* Date range button + dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowDatePicker((v) => !v); setShowFilters(false); }}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-gray-400"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {showDatePicker && (
              <DateRangeDropdown
                range={dateRange}
                onApply={(start, end) => { setDateRange({ start, end }); setShowDatePicker(false); }}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>

          {/* Filters button + dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowFilters((v) => !v); setShowDatePicker(false); }}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filters
              {(filters.category !== "Category" || filters.method !== "All") && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
            {showFilters && (
              <FiltersDropdown
                filters={filters}
                onChange={(f) => { setFilters(f); setPage(1); }}
                onClose={() => setShowFilters(false)}
                onReset={resetFilters}
              />
            )}
          </div>

          {/* Add Expense */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Expense
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.color} ${s.iconColor} flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
                {s.change ? (
                  <p className={`flex items-center gap-1 text-xs font-semibold mt-1 ${s.up ? "text-emerald-500" : "text-rose-400"}`}>
                    {s.up ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>
                    )}
                    {s.change} vs last {s.label === "This Month" ? "month" : "week"}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">{s.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Donut + Category bars */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Expenses Overview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-800">Expenses Overview</h2>
              <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">This Week</span>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <Donut segments={categoryTotals} total={`৳ ${totalExpenses.toLocaleString()}`} label="Total" />
              <div className="flex-1 space-y-3 min-w-[200px]">
                {categoryTotals.map((c) => (
                  <div key={c.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-gray-600">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-700 font-semibold">৳ {c.amount.toLocaleString()}</span>
                      <span className="text-gray-400 w-12 text-right">{c.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-gray-800">Expenses by Category</h2>
              <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">This Week</span>
            </div>
            <CategoryBars data={categoryTotals} max={maxCategoryAmount} />
          </div>
        </div>

        {/* Row 3: All Expenses + sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* All Expenses table */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-sm font-semibold text-gray-800">All Expenses</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-gray-300 absolute left-2.5 top-1/2 -translate-y-1/2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-2 outline-none focus:border-indigo-400 w-44 bg-white"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
                    className="text-xs border border-gray-200 rounded-lg pl-3 pr-7 py-2 outline-none focus:border-indigo-400 bg-white appearance-none cursor-pointer"
                  >
                    <option>Category</option>
                    {categoryList.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Category</th>
                    <th className="pb-2 text-left font-medium">Description</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                    <th className="pb-2 text-left font-medium pl-4">Payment Method</th>
                    <th className="pb-2 text-left font-medium">Added By</th>
                    <th className="pb-2 text-right font-medium w-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageItems.length === 0 ? (
                    <tr><td colSpan={7} className="py-6 text-center text-gray-400">No expenses found.</td></tr>
                  ) : pageItems.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 text-gray-500 whitespace-nowrap">{formatDate(e.date)}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryStyle[e.category] || "bg-gray-50 text-gray-600"}`}>
                          {e.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-600">{e.desc}</td>
                      <td className="py-2.5 text-rose-500 font-semibold text-right">৳ {e.amount.toLocaleString()}</td>
                      <td className="py-2.5 text-gray-500 pl-4">{e.method}</td>
                      <td className="py-2.5 text-gray-600">{e.by}</td>
                      <td className="py-2.5 text-right relative">
                        <button
                          onClick={(ev) => { ev.stopPropagation(); setOpenMenu(openMenu === e.id ? null : e.id); }}
                          className="text-gray-300 hover:text-gray-600 transition-colors px-1"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
                          </svg>
                        </button>
                        {openMenu === e.id && (
                          <div className="absolute right-0 top-7 z-10 bg-white border border-gray-100 rounded-lg shadow-lg py-1 w-28 text-left" onClick={(ev) => ev.stopPropagation()}>
                            <button
                              onClick={() => { setEditTarget(e); setOpenMenu(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(e.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <p className="text-xs text-gray-400">
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} expenses
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      currentPage === n ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 bg-white ml-1 cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Sidebar: Top categories + summary */}
          <div className="space-y-4">

            {/* Top Expense Categories */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Top Expense Categories</h2>
              <div className="space-y-3">
                {categoryTotals.map((c) => (
                  <div key={c.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{c.label}</span>
                    <span className="text-gray-800 font-semibold">৳ {c.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Summary */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Expense Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Expenses</span>
                  <span className="text-rose-500 font-semibold">৳ {totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">This Week</span>
                  <span className="text-gray-800 font-semibold">৳ {thisWeekTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">This Month</span>
                  <span className="text-gray-800 font-semibold">৳ {totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Average Daily</span>
                  <span className="text-gray-800 font-semibold">৳ {avgDaily.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <ExpenseModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />
      )}

      {/* Edit Expense Modal */}
      {editTarget && (
        <ExpenseModal initial={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />
      )}
    </div>
  );
}