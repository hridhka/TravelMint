import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      alert("Registration failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f7f7f9",
      }}
    >
      <form
        onSubmit={handleRegister}
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
          Register
        </h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <button type="submit">Register</button>

        <p style={{ textAlign: "center", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
