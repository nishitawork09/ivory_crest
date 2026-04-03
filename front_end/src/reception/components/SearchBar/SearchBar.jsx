import "./SearchBar.css";

export default function SearchBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="searchBar">
      <input
        type="text"
        placeholder="Search guest..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="Booked">Booked</option>
        <option value="Checked-In">Checked-In</option>
        <option value="Checked-Out">Checked-Out</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>
  );
}
