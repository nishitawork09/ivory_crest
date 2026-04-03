import { useEffect, useState } from "react";
import axios from "axios";
import "./A_User.css";

export default function A_Users() {
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // show only normal users
    const onlyUsers = res.data.filter((u) => u.role === "user");

    setUsers(onlyUsers);
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmDelete) return;

    await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchUsers();
  };

  return (
    <div className="usersContainer">
      <h2 className="usersTitle">User Management</h2>

      <div className="usersGrid">
        {users.map((u) => (
          <div key={u._id} className="userCard">
            <div className="userInfo">
              <p className="userEmail">{u.email}</p>
            </div>

            <div className="userActions">
              <button
                className="deleteUserBtn"
                onClick={() => deleteUser(u._id)}
              >
                Delete User
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
