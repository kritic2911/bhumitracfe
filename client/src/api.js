export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const TOKEN_KEY = "bhumitra_admin_token";

export function getStoredAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredAdminToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function adminHeaders() {
  const t = getStoredAdminToken();
  const h = { "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function adminLogin(password) {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Login failed");
  if (data.token) setStoredAdminToken(data.token);
  return data;
}

export async function adminSessionCheck() {
  const t = getStoredAdminToken();
  if (!t) return false;
  const res = await fetch(`${API_URL}/admin/session`, { headers: adminHeaders() });
  if (!res.ok) {
    setStoredAdminToken(null);
    return false;
  }
  return true;
}
