import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./A_Analytics.css";

// ── Chart accent colours — warm & neutral to match #faf9f6 palette ──────────
const ROOM_COLORS = ["#2c2c2c", "#7a6a58", "#b5a898", "#c9b99a", "#e8ddd0"];

const YEARS = [2026];

// ── Custom Tooltip ───────────────────────────────────────────────────────────
const EarningsTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="an-tooltip">
        <p className="an-tooltip-label">{label}</p>
        <p className="an-tooltip-value">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const GenericTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="an-tooltip">
        <p className="an-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p
            key={i}
            className="an-tooltip-value"
            style={{ color: p.color, fontSize: "1rem" }}
          >
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function A_Analytics() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [activeTab, setActiveTab] = useState("overview");
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Data state ──
  const [kpiData, setKpiData] = useState([]);
  const [monthlyBookings, setMonthlyBookings] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);

  // ── Fetch from your backend ─────────────────────────────────────────────────
  // Replace the URLs below with your actual API endpoints.
  // Expected response shapes are documented next to each call.
  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    async function fetchAll() {
      setLoading(true);
      const token = localStorage.getItem("token"); // ← add
      const headers = { Authorization: `Bearer ${token}` }; // ← add
      try {
        const [kpiRes, bookingsRes, earningsRes, roomsRes] = await Promise.all([
          // { totalBookings, totalUsers, totalEarnings, cancellations, deltas:{…} }
          fetch(`${BASE}/analytics/kpi?year=${selectedYear}`, { headers }),
          // [{ month:"Jan", bookings:38, users:22 }, …]
          fetch(`${BASE}/analytics/monthly-bookings?year=${selectedYear}`, {
            headers,
          }),
          // [{ month:"Jan", earnings:42000 }, …]
          fetch(`${BASE}/analytics/monthly-earnings?year=${selectedYear}`, {
            headers,
          }),
          // [{ room:"Deluxe Suite", bookings:142 }, …]
          fetch(`${BASE}/analytics/room-bookings?year=${selectedYear}`, {
            headers,
          }),
        ]);

        const [kpi, bookings, earnings, rooms] = await Promise.all([
          kpiRes.json(),
          bookingsRes.json(),
          earningsRes.json(),
          roomsRes.json(),
        ]);

        // Map KPI response → card format
        setKpiData([
          {
            label: "Total Bookings",
            value: kpi.totalBookings?.toLocaleString() ?? "—",
            delta: kpi.deltas?.bookings ?? "",
            positive: !String(kpi.deltas?.bookings).startsWith("-"),
            icon: "📅",
          },
          {
            label: "Total Users",
            value: kpi.totalUsers?.toLocaleString() ?? "—",
            delta: kpi.deltas?.users ?? "",
            positive: !String(kpi.deltas?.users).startsWith("-"),
            icon: "👥",
          },
          {
            label: "Total Earnings",
            value: kpi.totalEarnings
              ? `₹${(kpi.totalEarnings / 100000).toFixed(2)}L`
              : "—",
            delta: kpi.deltas?.earnings ?? "",
            positive: !String(kpi.deltas?.earnings).startsWith("-"),
            icon: "💰",
          },
          {
            label: "Cancellations",
            value: kpi.cancellations?.toLocaleString() ?? "—",
            delta: kpi.deltas?.cancellations ?? "",
            positive: String(kpi.deltas?.cancellations).startsWith("-"),
            icon: "❌",
          },
        ]);

        setMonthlyBookings(bookings);
        setMonthlyEarnings(earnings);
        // Attach colours to rooms
        setRoomBookings(
          rooms.map((r, i) => ({
            ...r,
            color: ROOM_COLORS[i % ROOM_COLORS.length],
          })),
        );
      } catch (err) {
        console.error("Analytics fetch failed:", err);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimate(true), 80);
      }
    }

    fetchAll();
  }, [selectedYear]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`an-root ${animate ? "an-visible" : ""}`}>
      {/* Header */}
      <div className="an-header">
        <div>
          <h2 className="an-title">Analytics</h2>
          <p className="an-subtitle">Bookings · Users · Revenue</p>
        </div>
        <div className="an-year-selector">
          {YEARS.map((y) => (
            <button
              key={y}
              className={`an-year-btn ${selectedYear === y ? "active" : ""}`}
              onClick={() => setSelectedYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="an-loading">Loading data…</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="an-kpi-grid">
            {kpiData.map((k, i) => (
              <div
                className="an-kpi-card"
                key={i}
                style={{ "--delay": `${i * 0.08}s` }}
              >
                <span className="an-kpi-icon">{k.icon}</span>
                <div className="an-kpi-info">
                  <p className="an-kpi-label">{k.label}</p>
                  <p className="an-kpi-value">{k.value}</p>
                </div>
                {k.delta && (
                  <span
                    className={`an-kpi-delta ${k.positive ? "pos" : "neg"}`}
                  >
                    {k.delta}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="an-charts-grid">
            {/* Bookings & Users / Month */}
            <div className="an-card an-card--wide">
              <h3 className="an-card-title">
                Bookings &amp; New Users — Monthly
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyBookings} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: "#999",
                      fontSize: 11,
                      fontFamily: "Montserrat",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "#999",
                      fontSize: 11,
                      fontFamily: "Montserrat",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<GenericTooltip />} />
                  <Legend
                    wrapperStyle={{
                      color: "#999",
                      fontSize: 11,
                      fontFamily: "Montserrat",
                      letterSpacing: "1px",
                    }}
                  />
                  <Bar
                    dataKey="bookings"
                    fill="#2c2c2c"
                    radius={[3, 3, 0, 0]}
                    name="Bookings"
                  />
                  <Bar
                    dataKey="users"
                    fill="#b5a898"
                    radius={[3, 3, 0, 0]}
                    name="New Users"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Room Popularity Pie */}
            <div className="an-card">
              <h3 className="an-card-title">Room Popularity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={roomBookings}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="bookings"
                  >
                    {roomBookings.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<GenericTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="an-legend">
                {roomBookings.map((r, i) => (
                  <li key={i} className="an-legend-item">
                    <span
                      className="an-legend-dot"
                      style={{ background: r.color }}
                    />
                    <span className="an-legend-name">{r.room}</span>
                    <span className="an-legend-count">{r.bookings}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Rooms Horizontal Bar */}
            <div className="an-card">
              <h3 className="an-card-title">Top Rooms by Bookings</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roomBookings} layout="vertical" barSize={14}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{
                      fill: "#999",
                      fontSize: 11,
                      fontFamily: "Montserrat",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="room"
                    type="category"
                    tick={{
                      fill: "#666",
                      fontSize: 11,
                      fontFamily: "Montserrat",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<GenericTooltip />} />
                  <Bar dataKey="bookings" radius={[0, 3, 3, 0]} name="Bookings">
                    {roomBookings.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Earnings Line */}
            <div className="an-card an-card--wide">
              <h3 className="an-card-title">
                Monthly Earnings (₹) — {selectedYear}
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyEarnings}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: "#999",
                      fontSize: 11,
                      fontFamily: "Montserrat",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "#999",
                      fontSize: 11,
                      fontFamily: "Montserrat",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<EarningsTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#2c2c2c"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#2c2c2c", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#7a6a58" }}
                    name="Earnings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
