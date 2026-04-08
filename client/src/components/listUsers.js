import React, { useEffect, useState } from "react";
import { API_URL, adminHeaders } from "../api";
import { themes } from "../themes";

const ListUsers = ({ theme, embedded }) => {
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [purchase, setPurchase] = useState("");
  const [editingId, setEditingId] = useState(null);

  const inputStyle = {
    backgroundColor: theme?.surface || theme?.cardBackground,
    color: theme?.text,
    borderColor: theme?.borderColor,
  };

  const getUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, { headers: adminHeaders() });
      if (response.status === 401) {
        alert("Session expired. Please sign in again.");
        return;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const jsonData = await response.json();
      setUsers(jsonData);
    } catch (err) {
      console.error("Failed to fetch users:", err.message);
      alert("Could not load users.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this registration?")) return;
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
      if (response.status === 401) {
        alert("Session expired.");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete failed");
      }
      setUsers((prev) => prev.filter((user) => user.reg_id !== id));
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const updateUser = async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({ feedback, purchase }),
      });
      if (response.status === 401) {
        alert("Session expired.");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Update failed");
      }
      await getUsers();
      setEditingId(null);
      setFeedback("");
      setPurchase("");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className={embedded ? "" : "container py-5"}>
      {!embedded && (
        <h2 className="h4 text-center mb-4" style={{ fontWeight: 600 }}>
          Registrations
        </h2>
      )}
      <div className="table-responsive rounded-4 overflow-hidden" style={{ border: `1px solid ${theme?.borderColor}` }}>
        <table className="table table-sm mb-0" style={{ color: theme?.text }}>
          <thead style={{ backgroundColor: theme?.accentWash, color: theme?.primary }}>
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Mobile</th>
              <th className="px-3 py-2">Feedback</th>
              <th className="px-3 py-2">Interest</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: theme?.surface || theme?.cardBackground }}>
            {users.map((user) => (
              <tr key={user.reg_id}>
                <td className="px-3 py-2 align-middle">{user.name}</td>
                <td className="px-3 py-2 align-middle small">{user.email}</td>
                <td className="px-3 py-2 align-middle">{user.mobile_no}</td>
                <td className="px-3 py-2 align-middle" style={{ minWidth: "140px" }}>
                  {editingId === user.reg_id ? (
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      style={inputStyle}
                    />
                  ) : (
                    <span className="small" style={{ color: theme?.muted }}>
                      {user.feedback || "—"}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-middle" style={{ minWidth: "160px" }}>
                  {editingId === user.reg_id ? (
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={purchase}
                      onChange={(e) => setPurchase(e.target.value)}
                      placeholder="Interest / product"
                      style={inputStyle}
                    />
                  ) : (
                    <span className="small">{user.purchase || "—"}</span>
                  )}
                </td>
                <td className="px-3 py-2 align-middle text-nowrap">
                  {editingId === user.reg_id ? (
                    <button
                      type="button"
                      className="btn btn-sm rounded-pill me-1"
                      style={{
                        backgroundColor: theme?.primary,
                        color: theme === themes.dark ? "#0a1610" : "#fffcf7",
                        border: "none",
                      }}
                      onClick={() => updateUser(user.reg_id)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill me-1"
                      onClick={() => {
                        setEditingId(user.reg_id);
                        setFeedback(user.feedback || "");
                        setPurchase(user.purchase || "");
                      }}
                    >
                      Edit
                    </button>
                  )}
                  <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => deleteUser(user.reg_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <p className="small text-center mt-3 mb-0" style={{ color: theme?.muted }}>
          No registrations yet.
        </p>
      )}
    </div>
  );
};

export default ListUsers;
