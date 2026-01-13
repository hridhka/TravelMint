import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        alert("No token received");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert("Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#5c9575",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "320px",
          padding: "24px",
          background: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        <p style={{ textAlign: "center", fontSize: "14px" }}>
          Don’t have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
