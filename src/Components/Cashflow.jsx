import { useState } from "react";

// ── Top Stat Cards ───────────────────────────────────────────
const stats = [
  {
    label: "Total Income", value: "৳ 245,000", change: "18.6%", up: true,
    color: "bg-emerald-50", iconColor: "text-emerald-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 000 4h4v-4z" />
      </svg>
    ),
  },
  {
    label: "Total Expenses", value: "৳ 206,350", change: "12.4%", up: false,
    color: "bg-rose-50", iconColor: "text-rose-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    label: "Net Profit", value: "৳ 38,650", change: "28.7%", up: true,
    color: "bg-sky-50", iconColor: "text-sky-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    label: "Cash Balance", value: "৳ 112,500", note: "Updated just now",
    color: "bg-indigo-50", iconColor: "text-indigo-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M6 16h2" />
      </svg>
    ),
  },
];

// ── Cashflow Overview chart data ────────────────────────────
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const chartData = [
  { day: "Mon", income: 38000, expenses: 24000, profit: 14000 },
  { day: "Tue", income: 41000, expenses: 21000, profit: 22000 },
  { day: "Wed", income: 48750, expenses: 32450, profit: 16300 },
  { day: "Thu", income: 36000, expenses: 27000, profit: 9000 },
  { day: "Fri", income: 43000, expenses: 24000, profit: 18000 },
  { day: "Sat", income: 39000, expenses: 26000, profit: 13000 },
  { day: "Sun", income: 60000, expenses: 35000, profit: 28000 },
];

function CashflowChart() {
  const w = 760, h = 280, padL = 40, padR = 10, padT = 10, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const max = 80000;
  const [hover, setHover] = useState(2); // default Wed like the image

  const barGroupW = innerW / chartData.length;
  const barW = 22;

  const yScale = (v) => padT + innerH - (v / max) * innerH;
  const xCenter = (i) => padL + barGroupW * i + barGroupW / 2;

  const linePts = chartData.map((d, i) => [xCenter(i), yScale(d.profit)]);
  const linePath = linePts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

  const yLabels = [0, 20000, 40000, 60000, 80000];

  const hoverData = hover !== null ? chartData[hover] : null;
  const tipX = hoverData ? xCenter(hover) : 0;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" onMouseLeave={() => setHover(2)}>
        {/* gridlines */}
        {yLabels.map((v, i) => (
          <g key={i}>
            <line x1={padL} y1={yScale(v)} x2={w - padR} y2={yScale(v)} stroke="#f1f5f9" strokeWidth={1} strokeDasharray={v === 0 ? "0" : "4 4"} />
            <text x={padL - 8} y={yScale(v) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
              {v === 0 ? "0" : `${v / 1000}k`}
            </text>
          </g>
        ))}

        {/* bars */}
        {chartData.map((d, i) => {
          const cx = xCenter(i);
          const incomeH = innerH - (yScale(d.income) - padT);
          const expH = innerH - (yScale(d.expenses) - padT);
          return (
            <g key={i} onMouseEnter={() => setHover(i)} className="cursor-pointer">
              <rect x={cx - barW - 2} y={yScale(d.income)} width={barW} height={incomeH} rx={4} fill={hover === i ? "#10b981" : "#6ee7b7"} />
              <rect x={cx + 2} y={yScale(d.expenses)} width={barW} height={expH} rx={4} fill={hover === i ? "#f43f5e" : "#fda4af"} />
              {/* invisible hit area */}
              <rect x={padL + barGroupW * i} y={padT} width={barGroupW} height={innerH} fill="transparent" />
            </g>
          );
        })}

        {/* profit line */}
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {linePts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={hover === i ? 5 : 4} fill="#3b82f6" stroke="white" strokeWidth={2} />
        ))}

        {/* hover vertical guide */}
        {hoverData && (
          <line x1={tipX} y1={padT} x2={tipX} y2={h - padB} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 3" />
        )}

        {/* x labels */}
        {chartData.map((d, i) => (
          <text key={i} x={xCenter(i)} y={h - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.day}</text>
        ))}
      </svg>

      {/* Tooltip */}
      {hoverData && (
        <div
          className="absolute bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs w-44 pointer-events-none transition-all duration-150"
          style={{
            left: `${(tipX / w) * 100}%`,
            top: 10,
            transform: tipX > w * 0.6 ? "translateX(-105%)" : "translateX(10%)",
          }}
        >
          <p className="font-semibold text-gray-700 mb-2">{`Wed, May ${22 - 2 + hover}`}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-2 rounded-full bg-emerald-500" />Income</span>
              <span className="font-semibold text-gray-700">৳ {hoverData.income.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-2 rounded-full bg-rose-500" />Expenses</span>
              <span className="font-semibold text-gray-700">৳ {hoverData.expenses.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500" />Profit</span>
              <span className="font-semibold text-gray-700">৳ {hoverData.profit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Donut chart (reusable) ──────────────────────────────────
function Donut({ segments, total, label, size = 150, stroke = 20 }) {
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
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
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="17" fontWeight="700" fill="#1e293b">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9.5" fill="#94a3b8">{label}</text>
    </svg>
  );
}

const incomeBreakdown = [
  { label: "COD Received", pct: 52.5, amount: "৳ 128,750", color: "#10b981" },
  { label: "Online Payments", pct: 47.5, amount: "৳ 116,250", color: "#3b82f6" },
];

const expenseBreakdown = [
  { label: "Cost of Goods", pct: 63.9, amount: "৳ 132,000", color: "#f43f5e" },
  { label: "Facebook Ads", pct: 21.8, amount: "৳ 45,000", color: "#8b5cf6" },
  { label: "Courier Charge", pct: 7.6, amount: "৳ 15,600", color: "#3b82f6" },
  { label: "Packaging", pct: 4.1, amount: "৳ 8,400", color: "#eab308" },
  { label: "Others", pct: 2.6, amount: "৳ 5,350", color: "#10b981" },
];

// ── Cashflow Summary ─────────────────────────────────────────
const summaryIncome = [
  { label: "Revenue", amount: "৳ 245,000" },
  { label: "COD Received", amount: "৳ 128,750" },
  { label: "Online Payments", amount: "৳ 116,250" },
];
const summaryExpenses = [
  { label: "Cost of Goods", amount: "৳ 132,000" },
  { label: "Facebook Ads", amount: "৳ 45,000" },
  { label: "Courier Charge", amount: "৳ 15,600" },
  { label: "Packaging", amount: "৳ 8,400" },
  { label: "Others", amount: "৳ 5,350" },
];

// ── Recent Transactions ──────────────────────────────────────
const transactions = [
  { date: "May 26, 2024", type: "Income", category: "Online Payment", desc: "Online order #1034", amount: "৳ 1,950", method: "bKash", by: "Priom Sheikh" },
  { date: "May 26, 2024", type: "Income", category: "COD Received", desc: "COD order #1033", amount: "৳ 2,450", method: "Cash", by: "Priom Sheikh" },
  { date: "May 26, 2024", type: "Expense", category: "Facebook Ads", desc: "Meta Ads Campaign", amount: "৳ 5,600", method: "bKash", by: "Priom Sheikh" },
  { date: "May 25, 2024", type: "Expense", category: "Courier Charge", desc: "Pathao Courier Charge", amount: "৳ 1,250", method: "Cash", by: "Priom Sheikh" },
  { date: "May 25, 2024", type: "Expense", category: "Packaging", desc: "Packaging Materials", amount: "৳ 840", method: "Cash", by: "Priom Sheikh" },
];

// ── Invested Amount — stat card (reads running total from ledger) ──
function InvestedAmountCard({ total, onAddClick }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">Invested Amount</p>
        <p className="text-xl font-bold text-gray-900 mt-1">৳ {total.toLocaleString()}</p>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Investment
        </button>
      </div>
    </div>
  );
}

// ── Investment Records table + add form ─────────────────────
const initialInvestments = [
  { id: 1, date: "2024-04-10", person: "Priom Sheikh", amount: 80000, note: "Initial capital" },
  { id: 2, date: "2024-05-02", person: "Rafi Islam",   amount: 50000, note: "Inventory restock" },
  { id: 3, date: "2024-05-18", person: "Priom Sheikh", amount: 20000, note: "Ad spend boost" },
];

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function InvestmentRecords({ investments, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", person: "", amount: "", note: "" });
  const [error, setError] = useState("");

  const total = investments.reduce((sum, r) => sum + r.amount, 0);

  const reset = () => { setForm({ date: "", person: "", amount: "", note: "" }); setError(""); };

  const submit = (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.date || !form.person.trim() || isNaN(amt) || amt <= 0) {
      setError("Please fill date, person, and a valid amount.");
      return;
    }
    onAdd({ id: Date.now(), date: form.date, person: form.person.trim(), amount: amt, note: form.note.trim() });
    reset();
    setShowForm(false);
  };

  return (
    <div id="investment-records" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Investment Records</h2>
          <p className="text-xs text-gray-400 mt-0.5">Total invested: <span className="font-semibold text-gray-600">৳ {total.toLocaleString()}</span></p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-lg px-3 py-2 text-xs font-medium shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {showForm ? "Cancel" : "Add Investment"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-400 bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Person</label>
            <input
              type="text"
              placeholder="e.g. Priom Sheikh"
              value={form.person}
              onChange={(e) => setForm({ ...form, person: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-400 bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Amount (৳)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9.]/g, "") })}
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-400 bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Note (optional)</label>
            <input
              type="text"
              placeholder="e.g. Inventory restock"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-400 bg-white"
            />
          </div>

          {error && <p className="sm:col-span-4 text-xs text-rose-500">{error}</p>}

          <div className="sm:col-span-4 flex justify-end gap-2 mt-1">
            <button type="button" onClick={() => { reset(); setShowForm(false); }}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-2">
              Cancel
            </button>
            <button type="submit"
              className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2 transition-colors">
              Save Investment
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="pb-2 text-left font-medium">Date</th>
              <th className="pb-2 text-left font-medium">Person</th>
              <th className="pb-2 text-left font-medium">Note</th>
              <th className="pb-2 text-right font-medium">Amount</th>
              <th className="pb-2 text-right font-medium w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {investments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">No investments recorded yet.</td>
              </tr>
            ) : (
              [...investments]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-2.5 text-gray-500 whitespace-nowrap">{formatDate(r.date)}</td>
                    <td className="py-2.5 text-gray-700 font-medium">{r.person}</td>
                    <td className="py-2.5 text-gray-400">{r.note || "—"}</td>
                    <td className="py-2.5 text-right font-semibold text-amber-600">৳ {r.amount.toLocaleString()}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onDelete(r.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all"
                        title="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Cashflow() {
  const [investments, setInvestments] = useState(initialInvestments);
  const investedTotal = investments.reduce((sum, r) => sum + r.amount, 0);

  const addInvestment = (record) => setInvestments((prev) => [...prev, record]);
  const removeInvestment = (id) => setInvestments((prev) => prev.filter((r) => r.id !== id));

  const scrollToRecords = () => {
    document.getElementById("investment-records")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cashflow</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your income, expenses and profit</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white shadow-sm hover:bg-gray-50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            May 20, 2024 - May 26, 2024
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-gray-400"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white shadow-sm hover:bg-gray-50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filters
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Report
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
                  <p className={`flex items-center gap-1 text-xs font-semibold mt-1 ${s.up ? "text-emerald-500" : "text-red-400"}`}>
                    {s.up ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>
                    )}
                    {s.change} vs last week
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">{s.note}</p>
                )}
              </div>
            </div>
          ))}

          {/* Invested Amount — links to records below */}
          <InvestedAmountCard total={investedTotal} onAddClick={scrollToRecords} />
        </div>

        {/* Row 2: Chart + Summary */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Cashflow Overview */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h2 className="text-sm font-semibold text-gray-800">Cashflow Overview</h2>
              <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
                This Week
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path d="M6 9l6 6 6-6"/></svg>
              </span>
            </div>
            <div className="flex items-center gap-5 mb-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Income</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" />Expenses</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Profit</span>
            </div>
            <CashflowChart />
          </div>

          {/* Cashflow Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Cashflow Summary</h2>
              <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
                This Week
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path d="M6 9l6 6 6-6"/></svg>
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-600 mb-2">Income</p>
              {summaryIncome.map((r) => (
                <div key={r.label} className="flex justify-between text-xs py-0.5">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="text-gray-700 font-medium">{r.amount}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold pt-2 border-t border-gray-100 mt-2 mb-1">
                <span className="text-gray-700">Total Income</span>
                <span className="text-emerald-600">৳ 245,000</span>
              </div>

              <p className="text-xs font-semibold text-rose-500 mb-2 pt-3">Expenses</p>
              {summaryExpenses.map((r) => (
                <div key={r.label} className="flex justify-between text-xs py-0.5">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="text-gray-700 font-medium">{r.amount}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold pt-2 border-t border-gray-100 mt-2">
                <span className="text-gray-700">Total Expenses</span>
                <span className="text-rose-500">৳ 206,350</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold bg-emerald-50 rounded-lg px-3 py-3 mt-4">
              <span className="text-gray-700">Net Profit</span>
              <span className="text-emerald-600">৳ 38,650</span>
            </div>
          </div>
        </div>

        {/* Row 3: Income Breakdown + Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Income Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Income Breakdown</h2>
            <div className="flex items-center gap-6 flex-wrap">
              <Donut segments={incomeBreakdown} total="৳ 245,000" label="Total Income" />
              <div className="flex-1 space-y-3 min-w-[180px]">
                {incomeBreakdown.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-gray-600">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{s.pct}%</span>
                      <span className="text-gray-700 font-semibold w-20 text-right">{s.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Expense Breakdown</h2>
            <div className="flex items-center gap-6 flex-wrap">
              <Donut segments={expenseBreakdown} total="৳ 206,350" label="Total Expenses" />
              <div className="flex-1 space-y-2.5 min-w-[180px]">
                {expenseBreakdown.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-gray-600">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{s.pct}%</span>
                      <span className="text-gray-700 font-semibold w-20 text-right">{s.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Recent Transactions + Cash Position */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Recent Transactions */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Type</th>
                    <th className="pb-2 text-left font-medium">Category</th>
                    <th className="pb-2 text-left font-medium">Description</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                    <th className="pb-2 text-left font-medium pl-4">Payment Method</th>
                    <th className="pb-2 text-left font-medium">Added By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((t, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 text-gray-500 whitespace-nowrap">{t.date}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.type === "Income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-700">{t.category}</td>
                      <td className="py-2.5 text-gray-500">{t.desc}</td>
                      <td className={`py-2.5 text-right font-semibold ${t.type === "Income" ? "text-emerald-600" : "text-rose-500"}`}>
                        {t.amount}
                      </td>
                      <td className="py-2.5 text-gray-500 pl-4">{t.method}</td>
                      <td className="py-2.5 text-gray-600">{t.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash Position */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Cash Position</h2>
              <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
                This Week
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path d="M6 9l6 6 6-6"/></svg>
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Opening Balance</span>
                <span className="text-gray-700 font-medium">৳ 80,200</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Income</span>
                <span className="text-emerald-600 font-medium">+ ৳ 245,000</span>
              </div>
              <div className="flex justify-between text-sm pb-3 border-b border-gray-100">
                <span className="text-gray-500">Total Expenses</span>
                <span className="text-rose-500 font-medium">- ৳ 206,350</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-indigo-50 rounded-lg px-3 py-3 mt-2">
              <span className="text-sm font-semibold text-indigo-700">Closing Balance</span>
              <span className="text-base font-bold text-indigo-700">৳ 118,850</span>
            </div>
          </div>
        </div>

        {/* Investment Records */}
        <InvestmentRecords investments={investments} onAdd={addInvestment} onDelete={removeInvestment} />

      </div>
    </div>
  );
}