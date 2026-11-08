
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      if (!res.data?.token) {
        setError("We couldn't complete your login. Please try again.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to log in. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Travel inspiration">
        <div className="auth-visual-overlay" />

        <Link to="/" className="auth-brand auth-brand-light">
          <span className="auth-brand-mark" aria-hidden="true">
            ✳
          </span>
          TravelMint
        </Link>

        <div className="auth-visual-copy">
          <span className="auth-eyebrow">YOUR JOURNEY STARTS HERE</span>
          <h1>
            The world is
            <br />
            waiting for you<span>.</span>
          </h1>
          <p>
            Plan thoughtfully. Travel freely.
            <br />
            Make every journey count.
          </p>
        </div>

        <span className="auth-image-caption">
          FIND YOUR NEXT CHAPTER
        </span>
      </section>

      <section className="auth-panel">
        <Link to="/" className="auth-brand auth-brand-dark">
          <span className="auth-brand-mark" aria-hidden="true">
            ✳
          </span>
          TravelMint
        </Link>

        <div className="auth-form-content">
          <span className="auth-eyebrow auth-eyebrow-dark">
            WELCOME BACK
          </span>

          <h2>Good to see you.</h2>
          <p className="auth-description">
            Sign in to pick up where your next adventure begins.
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing you in…" : "Sign in"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch">
            New to TravelMint? <Link to="/register">Create an account</Link>
          </p>
        </div>

        <footer className="auth-footer">
          TRAVEL WELL. SPEND THOUGHTFULLY.
        </footer>
      </section>
    </main>
  );
}

export default Login;
