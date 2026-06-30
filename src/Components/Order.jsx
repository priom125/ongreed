import { useState, useMemo, useEffect } from "react";

const API_BASE = "http://localhost:3000";

// ── Status pill styling ──────────────────────────────────────
const statusStyle = {
  Pending:   "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Packed:    "bg-purple-100 text-purple-700",
  Shipped:   "bg-indigo-100 text-indigo-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const statusOrder = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered"];

// ── Summary tab cards ─────────────────────────────────────────
const summaryTabs = [
  { key: "All",       label: "All Orders", color: "bg-gray-100", iconColor: "text-gray-500",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg> },
  { key: "Pending",   label: "Pending", color: "bg-amber-50", iconColor: "text-amber-500",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M20.59 13.41L13.42 20.58a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg> },
  { key: "Confirmed", label: "Confirmed", color: "bg-sky-50", iconColor: "text-sky-500",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg> },
  { key: "Packed",    label: "Packed", color: "bg-violet-50", iconColor: "text-violet-500",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M20 7L12 3 4 7v10l8 4 8-4V7z"/><path d="M4 7l8 4 8-4"/><path d="M12 11v10"/></svg> },
  { key: "Shipped",   label: "Shipped", color: "bg-indigo-50", iconColor: "text-indigo-500",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/></svg> },
  { key: "Delivered", label: "Delivered", color: "bg-emerald-50", iconColor: "text-emerald-500",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg> },
  { key: "Cancelled", label: "Cancelled", color: "bg-rose-50", iconColor: "text-rose-400",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
];

const tabFilters = ["All Orders", "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatDateTime(iso, time) {
  const formattedDate = formatDate(iso);
  return `${formattedDate}${formattedDate && time ? ` ${time}` : time || formattedDate}`;
}

// Normalize whatever shape the API returns (e.g. Mongo's _id) into the shape the UI expects
function normalizeOrder(raw, fallbackId) {
  return {
    id: String(raw.id || raw._id || fallbackId),
    customer: String(raw.customer || ""),
    phone: String(raw.phone || ""),
    products: Array.isArray(raw.products) ? raw.products : [],
    amount: Number(raw.amount) || 0,
    shipping: Number(raw.shipping) || 0,
    discount: Number(raw.discount) || 0,
    payment: String(raw.payment || "COD"),
    status: String(raw.status || "Pending"),
    date: raw.date || new Date().toISOString().slice(0, 10),
    time: raw.time || "",
    address: String(raw.address || ""),
    area: String(raw.area || "—"),
    courier: String(raw.courier || "Pathao"),
    tracking: String(raw.tracking || "-"),
  };
}

// ── Order Details side panel ────────────────────────────────
function OrderDetailsPanel({ order, onClose, onStatusChange, onCancel }) {
  if (!order) return null;
  const products = Array.isArray(order.products) ? order.products : [];
  const subtotal = products.reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.qty) || 0), 0);
  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <aside className="w-full xl:w-[340px] flex-shrink-0 bg-white border-l border-gray-100 h-full overflow-y-auto">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Order Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">Order ID: <span className="text-indigo-600 font-semibold">{order.id}</span></p>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyle[order.status]}`}>{order.status}</span>
        </div>

        {/* Customer Info */}
        <p className="text-xs font-semibold text-gray-700 mb-2">Customer Information</p>
        <div className="bg-gray-50 rounded-xl p-3.5 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{order.customer}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.phone}</p>
              <p className="text-xs text-gray-400 mt-2">{order.address}</p>
              <p className="text-xs text-gray-400">{order.area}</p>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <a href={`tel:${order.phone}`} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </a>
              <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <p className="text-xs font-semibold text-gray-700 mb-2">Order Information</p>
        <div className="space-y-2 text-xs mb-5">
          <div className="flex justify-between"><span className="text-gray-400">Order Date</span><span className="text-gray-700 font-medium">{formatDateTime(order.date, order.time)}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Payment Method</span><span className="text-gray-700 font-medium">{order.payment === "COD" ? "Cash on Delivery" : "Online Payment"}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Courier</span><span className="text-gray-700 font-medium">{order.courier}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Tracking Number</span><span className="text-gray-700 font-medium">{order.tracking}</span></div>
        </div>

        {/* Products */}
        <p className="text-xs font-semibold text-gray-700 mb-2">Products ({products.length})</p>
        <div className="space-y-3 mb-4">
          {products.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                <p className="text-[11px] text-gray-400">Size: {p.size} &bull; Qty: {p.qty}</p>
              </div>
              <p className="text-xs font-semibold text-gray-700 flex-shrink-0">৳ {(Number(p.price) * Number(p.qty) || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3 mb-3">
          <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-gray-700">৳ {(Number(subtotal) || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Shipping Charge</span><span className="text-gray-700">৳ {(Number(order.shipping) || 0).toLocaleString()}</span></div>
          {(Number(order.discount) || 0) > 0 && (
            <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-rose-500">- ৳ {(Number(order.discount) || 0).toLocaleString()}</span></div>
          )}
        </div>

        <div className="flex justify-between items-center border-t border-gray-100 pt-3 mb-5">
          <span className="text-sm font-semibold text-gray-800">Total Amount</span>
          <span className="text-base font-bold text-indigo-600">৳ {(Number(order.amount) || 0).toLocaleString()}</span>
        </div>

        {/* Timeline */}
        <p className="text-xs font-semibold text-gray-700 mb-3">Order Timeline</p>
        <div className="space-y-0 mb-6">
          {statusOrder.map((s, i) => {
            const done = i <= currentIdx && order.status !== "Cancelled";
            const isCurrent = i === currentIdx;
            return (
              <div key={s} className="flex gap-3 relative">
                <div className="flex flex-col items-center">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                    order.status === "Cancelled" ? "bg-gray-200" : done ? "bg-indigo-500" : "bg-gray-200"
                  }`} />
                  {i < statusOrder.length - 1 && <span className="w-px flex-1 bg-gray-100 my-0.5" style={{ minHeight: 20 }} />}
                </div>
                <div className="pb-4">
                  <p className={`text-xs font-medium ${done ? "text-gray-800" : "text-gray-400"}`}>{s === "Pending" ? "Order Placed" : s}</p>
                  {isCurrent && order.status !== "Cancelled" && (
                    <p className="text-[11px] text-gray-400">{formatDateTime(order.date, order.time)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 sticky bottom-0 bg-white pt-2">
          <button
            onClick={() => onCancel(order.id)}
            disabled={order.status === "Cancelled" || order.status === "Delivered"}
            className="flex-1 text-sm font-medium text-rose-500 border border-rose-200 rounded-lg py-2.5 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel Order
          </button>
          <div className="flex-1 relative group">
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              className="w-full appearance-none text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-2.5 px-4 transition-colors cursor-pointer text-center"
            >
              {[...statusOrder, "Cancelled"].map((s) => <option key={s} value={s} className="text-gray-800">{s}</option>)}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Product catalog for New Order form ──────────────────────
const productCatalog = [
  { name: "Argentina Home Jersey", price: 950 },
  { name: "Brazil Home Jersey", price: 950 },
  { name: "Portugal Home Jersey", price: 950 },
  { name: "France Home Jersey", price: 950 },
  { name: "Oversized Drop Shoulder T-Shirt", price: 890 },
];
const sizeOptions = ["S", "M", "L", "XL", "XXL"];
const courierOptions = ["Pathao", "RedX", "Steadfast"];

function emptyLineItem() {
  return { id: Math.random().toString(36).slice(2), product: productCatalog[0].name, size: "M", qty: 1 };
}

// ── New Order Modal ──────────────────────────────────────────
function NewOrderModal({ onClose, onSave, nextOrderId }) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [payment, setPayment] = useState("COD");
  const [courier, setCourier] = useState("Pathao");
  const [shipping, setShipping] = useState("60");
  const [discount, setDiscount] = useState("0");
  const [items, setItems] = useState([emptyLineItem()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const priceFor = (name) => productCatalog.find((p) => p.name === name)?.price || 0;

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, emptyLineItem()]);
  const removeItem = (id) => setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

  const subtotal = items.reduce((s, it) => s + priceFor(it.product) * Number(it.qty || 0), 0);
  const shippingNum = parseFloat(shipping) || 0;
  const discountNum = parseFloat(discount) || 0;
  const total = subtotal + shippingNum - discountNum;

  const submit = async (e) => {
    e.preventDefault();
    if (!customer.trim() || !phone.trim() || !address.trim() || items.some((it) => !it.qty || Number(it.qty) <= 0)) {
      setError("Please fill customer name, phone, address, and valid quantities for all items.");
      return;
    }
    const now = new Date();
    const order = {
      id: nextOrderId,
      customer: customer.trim(),
      phone: phone.trim(),
      products: items.map((it) => ({ name: it.product, size: it.size, qty: Number(it.qty), price: priceFor(it.product) })),
      amount: total,
      shipping: shippingNum,
      discount: discountNum,
      payment,
      status: "Pending",
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      address: address.trim(),
      area: area.trim() || "—",
      courier,
      tracking: "-",
    };

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      onSave(normalizeOrder({ ...order, ...data }, order.id));
    } catch (err) {
      console.error("Error saving order:", err);
      setError("Failed to save order. Is the API server running on localhost:3000?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0 bg-white border-b border-gray-50 z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">New Order</h2>
            <p className="text-xs text-gray-400 mt-0.5">Order ID will be <span className="text-indigo-600 font-semibold">{nextOrderId}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={submit} className="px-6 pb-6 pt-4 space-y-5">

          {/* Customer info */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Customer Information</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Customer name" value={customer} onChange={(e) => setCustomer(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400" />
              <input type="text" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400" />
              <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 col-span-2" />
              <input type="text" placeholder="Area, city - postcode" value={area} onChange={(e) => setArea(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 col-span-2" />
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700">Products</p>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Product
              </button>
            </div>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-2">
                  <select
                    value={it.product}
                    onChange={(e) => updateItem(it.id, { product: e.target.value })}
                    className="col-span-5 text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-indigo-400 bg-white"
                  >
                    {productCatalog.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                  <select
                    value={it.size}
                    onChange={(e) => updateItem(it.id, { size: e.target.value })}
                    className="col-span-2 text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-indigo-400 bg-white"
                  >
                    {sizeOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <input
                    type="text" inputMode="numeric" placeholder="Qty"
                    value={it.qty}
                    onChange={(e) => updateItem(it.id, { qty: e.target.value.replace(/[^0-9]/g, "") })}
                    className="col-span-2 text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-indigo-400 bg-white text-center"
                  />
                  <span className="col-span-2 text-xs font-semibold text-gray-700 text-right">৳ {(priceFor(it.product) * Number(it.qty || 0)).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    disabled={items.length === 1}
                    className="col-span-1 text-gray-300 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex justify-end"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & courier & charges */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Payment Method</label>
              <select value={payment} onChange={(e) => setPayment(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white">
                <option value="COD">Cash on Delivery</option>
                <option value="Online">Online Payment</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Courier</label>
              <select value={courier} onChange={(e) => setCourier(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white">
                {courierOptions.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Shipping Charge (৳)</label>
              <input type="text" inputMode="numeric" value={shipping} onChange={(e) => setShipping(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Discount (৳)</label>
              <input type="text" inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400" />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>৳ {subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500"><span>Shipping Charge</span><span>৳ {shippingNum.toLocaleString()}</span></div>
            {discountNum > 0 && <div className="flex justify-between text-rose-500"><span>Discount</span><span>- ৳ {discountNum.toLocaleString()}</span></div>}
            <div className="flex justify-between font-bold text-gray-800 pt-1.5 border-t border-gray-200 mt-1.5">
              <span>Total Amount</span><span className="text-indigo-600">৳ {total.toLocaleString()}</span>
            </div>
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
            <button type="submit" disabled={saving} className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("All Orders");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [showNewOrder, setShowNewOrder] = useState(false);

  // Fetch real orders from the database on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    fetch(`${API_BASE}/order`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data.orders || [];
        const normalized = list.map((o, i) => normalizeOrder(o, `#${1000 + i}`));
        setOrders(normalized);
        if (normalized.length) setSelectedOrderId(normalized[0].id);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching orders:", err);
        setLoadError("Could not load orders from the server. Is it running on localhost:3000?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => {
    const c = { All: orders.length };
    statusOrder.concat("Cancelled").forEach((s) => { c[s] = orders.filter((o) => o.status === s).length; });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesTab = activeTab === "All Orders" || o.status === activeTab;
      const id = String(o.id || "");
      const customer = String(o.customer || "");
      const phone = String(o.phone || "");
      const matchesSearch =
        id.toLowerCase().includes(searchLower) ||
        customer.toLowerCase().includes(searchLower) ||
        phone.includes(search);
      const matchesPayment = paymentFilter === "All" || o.payment === paymentFilter;
      return matchesTab && matchesSearch && matchesPayment;
    });
  }, [orders, activeTab, search, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (pageItems.every((o) => selected.has(o.id))) {
      setSelected((prev) => { const next = new Set(prev); pageItems.forEach((o) => next.delete(o.id)); return next; });
    } else {
      setSelected((prev) => { const next = new Set(prev); pageItems.forEach((o) => next.add(o.id)); return next; });
    }
  };

  const updateStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    // Persist the change to the server
    fetch(`${API_BASE}/order/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch((err) => console.error("Error updating order status:", err));
  };
  const cancelOrder = (id) => updateStatus(id, "Cancelled");

  const nextOrderId = useMemo(() => {
    const maxNum = orders.reduce((max, o) => {
      const idValue = String(o.id || "");
      const n = parseInt(idValue.replace("#", ""), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 1000);
    return `#${maxNum + 1}`;
  }, [orders]);

  const addOrder = (normalizedOrder) => {
    setOrders((prev) => [normalizedOrder, ...prev]);
    setSelectedOrderId(normalizedOrder.id);
    setActiveTab("All Orders");
    setPage(1);
    setShowNewOrder(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex" onClick={() => { setOpenMenu(null); setShowFilters(false); }}>
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage and track all customer orders</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by Order ID, customer or phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="text-sm border border-gray-200 rounded-lg pl-9 pr-12 py-2 outline-none focus:border-indigo-400 w-72 bg-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 border border-gray-200 rounded px-1.5 py-0.5">⌘K</span>
            </div>

            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowFilters((v) => !v); }}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white shadow-sm hover:bg-gray-50 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filters
                {paymentFilter !== "All" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-100 rounded-xl shadow-lg p-4 w-56" onClick={(e) => e.stopPropagation()}>
                  <p className="text-xs font-semibold text-gray-700 mb-3">Filter Orders</p>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Payment Method</label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white"
                  >
                    <option value="All">All Methods</option>
                    <option value="COD">COD</option>
                    <option value="Online">Online</option>
                  </select>
                  <div className="flex justify-between mt-3">
                    <button onClick={() => setPaymentFilter("All")} className="text-xs font-medium text-gray-500 hover:text-gray-700">Reset</button>
                    <button onClick={() => setShowFilters(false)} className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5">Done</button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowNewOrder(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Order
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">

          {loadError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl px-4 py-3">
              {loadError}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {summaryTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key === "All" ? "All Orders" : t.key); setPage(1); }}
                className={`bg-white rounded-xl border shadow-sm p-3.5 flex items-center gap-3 text-left transition-colors ${
                  (activeTab === "All Orders" && t.key === "All") || activeTab === t.key
                    ? "border-indigo-300 ring-1 ring-indigo-100"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${t.color} ${t.iconColor} flex items-center justify-center flex-shrink-0`}>{t.icon}</div>
                <div>
                  <p className="text-[11px] text-gray-400">{t.label}</p>
                  <p className="text-lg font-bold text-gray-900">{counts[t.key] ?? 0}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Table card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {/* Tabs */}
            <div className="flex items-center gap-5 px-5 pt-4 border-b border-gray-100 overflow-x-auto">
              {tabFilters.map((t) => (
                <button
                  key={t}
                  onClick={() => { setActiveTab(t); setPage(1); }}
                  className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === t ? "text-indigo-600 border-indigo-600" : "text-gray-400 border-transparent hover:text-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="py-3 pl-5 text-left w-8">
                      <input type="checkbox" checked={pageItems.length > 0 && pageItems.every((o) => selected.has(o.id))} onChange={toggleSelectAll} className="rounded border-gray-300" />
                    </th>
                    <th className="py-3 text-left font-medium">Order ID</th>
                    <th className="py-3 text-left font-medium">Customer</th>
                    <th className="py-3 text-left font-medium">Phone</th>
                    <th className="py-3 text-left font-medium">Products</th>
                    <th className="py-3 text-right font-medium">Amount</th>
                    <th className="py-3 text-left font-medium pl-4">Payment</th>
                    <th className="py-3 text-left font-medium">Status</th>
                    <th className="py-3 text-left font-medium">Date</th>
                    <th className="py-3 text-right font-medium pr-5 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={10} className="py-8 text-center text-gray-400">Loading orders…</td></tr>
                  ) : pageItems.length === 0 ? (
                    <tr><td colSpan={10} className="py-8 text-center text-gray-400">No orders found.</td></tr>
                  ) : pageItems.map((o, index) => (
                    <tr
                      key={o.id || `order-${index}`}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedOrderId === o.id ? "bg-indigo-50/40" : ""}`}
                    >
                      <td className="py-3 pl-5" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSelect(o.id)} className="rounded border-gray-300" />
                      </td>
                      <td className="py-3 text-indigo-600 font-semibold">{o.id}</td>
                      <td className="py-3 text-gray-700">{o.customer}</td>
                      <td className="py-3 text-gray-500">{o.phone}</td>
                      <td className="py-3 text-gray-500">{(o.products || []).length} {(o.products || []).length === 1 ? "item" : "items"}</td>
                      <td className="py-3 text-gray-700 text-right">৳ {(Number(o.amount) || 0).toLocaleString()}</td>
                      <td className="py-3 text-gray-500 pl-4">{o.payment}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="py-3 text-gray-400 whitespace-nowrap">{formatDate(o.date)}</td>
                      <td className="py-3 pr-5 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)} className="text-gray-300 hover:text-gray-600 transition-colors px-1">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>
                        </button>
                        {openMenu === o.id && (
                          <div className="absolute right-5 top-8 z-10 bg-white border border-gray-100 rounded-lg shadow-lg py-1 w-32 text-left">
                            <button onClick={() => { setSelectedOrderId(o.id); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">View Details</button>
                            <button onClick={() => { cancelOrder(o.id); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50">Cancel Order</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
              <p className="text-xs text-gray-400">
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} orders
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${currentPage === n ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{n}</button>
                ))}
                {totalPages > 4 && <span className="text-gray-300 px-1">...</span>}
                {totalPages > 3 && (
                  <button onClick={() => setPage(totalPages)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${currentPage === totalPages ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{totalPages}</button>
                )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 bg-white ml-1 cursor-pointer">
                  <option>10 / page</option>
                  <option>25 / page</option>
                  <option>50 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details side panel */}
      <OrderDetailsPanel
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        onStatusChange={updateStatus}
        onCancel={cancelOrder}
      />

      {/* New Order modal */}
      {showNewOrder && (
        <NewOrderModal
          nextOrderId={nextOrderId}
          onClose={() => setShowNewOrder(false)}
          onSave={addOrder}
        />
      )}
    </div>
  );
}