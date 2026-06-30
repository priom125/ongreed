import { useState } from "react";

// ── Stat Cards ──────────────────────────────────────────────
const stats = [
  {
    label: "Total Orders",
    value: "128",
    change: "+18%",
    up: true,
    color: "bg-indigo-50",
    iconColor: "text-indigo-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    label: "Revenue",
    value: "৳ 45,230",
    change: "+22%",
    up: true,
    color: "bg-green-50",
    iconColor: "text-green-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    label: "Profit (Est.)",
    value: "৳ 15,650",
    change: "+16%",
    up: true,
    color: "bg-orange-50",
    iconColor: "text-orange-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    label: "Pending COD",
    value: "৳ 18,750",
    change: "-5%",
    up: false,
    color: "bg-blue-50",
    iconColor: "text-blue-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: "Customers",
    value: "1,248",
    change: "+12%",
    up: true,
    color: "bg-purple-50",
    iconColor: "text-purple-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "Products",
    value: "56",
    change: "+3%",
    up: true,
    color: "bg-red-50",
    iconColor: "text-red-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

// ── Order Status ─────────────────────────────────────────────
const orderStatus = [
  { label: "Pending",   count: 24, pct: 18.8, color: "#6366f1" },
  { label: "Confirmed", count: 32, pct: 25.0, color: "#38bdf8" },
  { label: "Packed",    count: 18, pct: 14.1, color: "#fb923c" },
  { label: "Shipped",   count: 28, pct: 21.9, color: "#f43f5e" },
  { label: "Delivered", count: 20, pct: 15.6, color: "#34d399" },
  { label: "Cancelled", count:  6, pct:  4.6, color: "#f472b6" },
];

function DonutChart({ segments, total }) {
  const r = 54;
  const cx = 70, cy = 70;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 140 140" className="w-40 h-40">
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={18}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" className="text-2xl font-bold" fontSize="20" fontWeight="700" fill="#1e293b">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8">Total</text>
    </svg>
  );
}

// ── Revenue Sparkline ────────────────────────────────────────
const revenueData = [12000, 28000, 18000, 35000, 22000, 40000, 48000];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function RevenueChart() {
  const w = 340, h = 130, pad = 10;
  const max = Math.max(...revenueData);
  const min = Math.min(...revenueData);
  const pts = revenueData.map((v, i) => {
    const x = pad + (i / (revenueData.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return [x, y];
  });
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  const yLabels = [0, 12500, 25000, 37500, 50000];

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w + 40} ${h + 30}`} className="w-full">
        {/* Y labels */}
        {yLabels.map((v, i) => {
          const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
          return (
            <g key={i}>
              <line x1={36} y1={y} x2={w + 36} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={30} y={y + 4} textAnchor="end" fontSize="8" fill="#94a3b8">
                {v >= 1000 ? `${v / 1000}k` : v}
              </text>
            </g>
          );
        })}
        {/* Area fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath.replace(/(\d+\.?\d*),/g, (m, n) => `${parseFloat(n) + 36},`)} fill="url(#areaGrad)" />
        {/* Line */}
        <path
          d={linePath.replace(/(\d+\.?\d*),/g, (m, n) => `${parseFloat(n) + 36},`)}
          fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Dots */}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x + 36} cy={y} r={3.5} fill="white" stroke="#6366f1" strokeWidth={2} />
        ))}
        {/* X labels */}
        {pts.map(([x], i) => (
          <text key={i} x={x + 36} y={h + 22} textAnchor="middle" fontSize="8" fill="#94a3b8">{days[i]}</text>
        ))}
      </svg>
    </div>
  );
}

// ── Top Products ─────────────────────────────────────────────
const products = [
  { rank: 1, name: "Argentina Home Jersey", sold: 85, revenue: 80750, color: "bg-sky-100 text-sky-700" },
  { rank: 2, name: "Brazil Home Jersey",    sold: 64, revenue: 60800, color: "bg-yellow-100 text-yellow-700" },
  { rank: 3, name: "Portugal Home Jersey",  sold: 42, revenue: 39900, color: "bg-red-100 text-red-600" },
  { rank: 4, name: "Oversized Drop T-Shirt",sold: 38, revenue: 28120, color: "bg-gray-100 text-gray-600" },
  { rank: 5, name: "France Home Jersey",    sold: 31, revenue: 29450, color: "bg-blue-100 text-blue-700" },
];

// ── Recent Orders ─────────────────────────────────────────────
const orders = [
  { id: "#1025", customer: "Hasan Mahmud", total: "৳ 1,950", payment: "COD",    status: "Pending",   statusColor: "bg-amber-100 text-amber-700",  date: "May 20, 2024" },
  { id: "#1024", customer: "Rafi Islam",   total: "৳ 950",   payment: "Online", status: "Confirmed", statusColor: "bg-green-100 text-green-700",  date: "May 20, 2024" },
  { id: "#1023", customer: "Nusrat Jahan", total: "৳ 2,850", payment: "COD",    status: "Shipped",   statusColor: "bg-blue-100 text-blue-700",    date: "May 19, 2024" },
  { id: "#1022", customer: "Sakib Al Hasan",total:"৳ 1,780", payment: "COD",    status: "Delivered", statusColor: "bg-emerald-100 text-emerald-700",date:"May 19, 2024"},
  { id: "#1021", customer: "Mehedi Hasan", total: "৳ 950",   payment: "COD",    status: "Packed",    statusColor: "bg-purple-100 text-purple-700", date: "May 19, 2024" },
];

// ── Recent Expenses ──────────────────────────────────────────
const expenses = [
  { date: "May 20, 2024", category: "Facebook Ads", desc: "Meta Ads Campaign",    amount: "৳ 5,600", method: "bKash", by: "Priom Sheikh" },
  { date: "May 20, 2024", category: "Courier",      desc: "Pathao Courier Charge",amount: "৳ 1,250", method: "Cash",  by: "Priom Sheikh" },
  { date: "May 19, 2024", category: "Packaging",    desc: "Packaging Materials",  amount: "৳ 840",   method: "Cash",  by: "Priom Sheikh" },
  { date: "May 19, 2024", category: "Others",       desc: "Office Supplies",      amount: "৳ 560",   method: "Cash",  by: "Priom Sheikh" },
];

// ── Cashflow ─────────────────────────────────────────────────
const cashflow = {
  income: [
    { label: "Revenue",         amount: "৳ 245,000" },
    { label: "COD Received",    amount: "৳ 128,750" },
    { label: "Online Payments", amount: "৳ 116,250" },
  ],
  expenses: [
    { label: "Cost of Goods", amount: "৳ 132,000" },
    { label: "Facebook Ads",  amount: "৳ 45,000"  },
    { label: "Courier Charge",amount: "৳ 15,600"  },
    { label: "Packaging",     amount: "৳ 8,400"   },
    { label: "Others",        amount: "৳ 5,350"   },
  ],
};

// ── Main Dashboard ───────────────────────────────────────────
export default function Dashboard() {
  const [dateRange] = useState("May 20, 2024 – May 26, 2024");

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Overview of your business</p>
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {dateRange}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center ${s.iconColor}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${s.up ? "text-emerald-500" : "text-red-400"}`}>
                {s.up ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><polyline points="18 15 12 9 6 15"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><polyline points="6 9 12 15 18 9"/></svg>
                )}
                {s.change} vs last week
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Order Status + Revenue + Cashflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Order Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Order Status</h2>
            <div className="flex items-center gap-6">
              <DonutChart segments={orderStatus} total={128} />
              <div className="flex-1 space-y-2">
                {orderStatus.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-gray-600">{s.label}</span>
                    </div>
                    <span className="text-gray-500 font-medium">{s.count} <span className="text-gray-300">({s.pct}%)</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Revenue Overview</h2>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">This Week</span>
            </div>
            <RevenueChart />
          </div>

          {/* Cashflow Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Cashflow Summary</h2>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">This Month</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Income</p>
              {cashflow.income.map((r) => (
                <div key={r.label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="text-gray-700 font-medium">{r.amount}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold pt-2 border-t border-gray-100 mt-2">
                <span className="text-gray-700">Total Income</span>
                <span className="text-emerald-600">৳ 245,000</span>
              </div>

              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2 pt-4">Expenses</p>
              {cashflow.expenses.map((r) => (
                <div key={r.label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="text-gray-700 font-medium">{r.amount}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold pt-2 border-t border-gray-100 mt-2">
                <span className="text-gray-700">Total Expenses</span>
                <span className="text-red-500">৳ 206,350</span>
              </div>

              <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-200 mt-2">
                <span className="text-gray-800">Net Profit</span>
                <span className="text-indigo-600">৳ 38,650</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Top Products + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top Selling Products */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Top Selling Products</h2>
              <button className="text-xs text-indigo-600 font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.rank} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${p.color}`}>
                    {p.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sold} sold</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 flex-shrink-0">৳ {p.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
              <button className="text-xs text-indigo-600 font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="pb-2 text-left font-medium">Order ID</th>
                    <th className="pb-2 text-left font-medium">Customer</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                    <th className="pb-2 text-left font-medium pl-3">Payment</th>
                    <th className="pb-2 text-left font-medium">Status</th>
                    <th className="pb-2 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 text-indigo-600 font-semibold">{o.id}</td>
                      <td className="py-2.5 text-gray-700">{o.customer}</td>
                      <td className="py-2.5 text-gray-700 text-right">{o.total}</td>
                      <td className="py-2.5 text-gray-500 pl-3">{o.payment}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${o.statusColor}`}>{o.status}</span>
                      </td>
                      <td className="py-2.5 text-gray-400 whitespace-nowrap">{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Expenses</h2>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map((e, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 text-gray-500 whitespace-nowrap">{e.date}</td>
                    <td className="py-2.5 text-gray-700 font-medium">{e.category}</td>
                    <td className="py-2.5 text-gray-500">{e.desc}</td>
                    <td className="py-2.5 text-gray-800 font-semibold text-right">{e.amount}</td>
                    <td className="py-2.5 text-gray-500 pl-4">{e.method}</td>
                    <td className="py-2.5 text-gray-600">{e.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}