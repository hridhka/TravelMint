
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(true);

      redirectTimer.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("REGISTRATION ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your details and try again."
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
          <span className="auth-eyebrow">A WORLD OF POSSIBILITIES</span>
          <h1>
            Collect moments,
            <br />
            not just miles<span>.</span>
          </h1>
          <p>
            Your plans, your budget,
            <br />
            your next unforgettable journey.
          </p>
        </div>

        <span className="auth-image-caption">
          EVERY JOURNEY HAS A STORY
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
            BEGIN YOUR JOURNEY
          </span>

          <h2>Create your account.</h2>
          <p className="auth-description">
            A thoughtful way to plan trips and keep your spending on track.
          </p>

          <form className="auth-form" onSubmit={handleRegister}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="auth-success" role="status">
                Registration successful. Redirecting to login…
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading || success}
            >
              {loading
                ? "Creating your account…"
                : success
                  ? "Account created"
                  : "Create account"}

              {!loading && !success && (
                <span aria-hidden="true">→</span>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <footer className="auth-footer">
          TRAVEL WELL. SPEND THOUGHTFULLY.
        </footer>
      </section>
    </main>
  );
}

export default Register;
