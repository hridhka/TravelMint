import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false); // ✅ ADDED
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess(true); // ✅ SHOW SUCCESS MESSAGE

      setTimeout(() => {
        navigate("/login");
      }, 1500); // smooth redirect
    } catch (err) {
      console.error(
        "Registration failed. Email may already exist.",
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
          "Registration failed. Email may already exist."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleRegister}
        style={{
          width: "340px",
          padding: "28px",
          background: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Register
        </h2>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "8px",
          }}
        >
          Create your account
        </p>

        {/* ✅ SUCCESS MESSAGE */}
        {success && (
          <div
            style={{
              background: "#ecfdf5",
              color: "#065f46",
              padding: "10px",
              borderRadius: "10px",
              fontSize: "14px",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            ✅ Registration successful. Redirecting to login…
          </div>
        )}

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: "6px",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #16a34a, #16a34a)",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          Register
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            marginTop: "10px",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#16a34a",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
