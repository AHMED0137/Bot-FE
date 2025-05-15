import React, { useState } from "react";
import "./login.css";

const Login = () => {
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const username = form.get("username");
    const password = form.get("password");
    const BACKEND_URL = "https://bot-app-production.up.railway.app/api/login";
    const res = await fetch(`${BACKEND_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      window.location.href = "/home";
    } else {
      const data = await res.json();
      setError(data.error || "Invalid username or password.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #6366f1, #8b5cf6)",
        padding: "16px",
      }}
    >
      <div className="login-card">
        <h2>Login to Dashboard</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div className="form-actions">
            <button type="submit">Login</button>
          </div>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
