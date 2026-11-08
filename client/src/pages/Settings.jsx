
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Settings.css";

const defaultPreferences = {
  currency: "INR",
  appearance: "light",
  tripReminders: true,
  budgetAlerts: true,
  travelUpdates: false,
};

function readPreferences() {
  try {
    const stored = localStorage.getItem("travelmint-preferences");
    return stored
      ? { ...defaultPreferences, ...JSON.parse(stored) }
      : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function Settings() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") ||
    localStorage.getItem("name") ||
    "Traveller";

  const [preferences, setPreferences] = useState(readPreferences);
  const [saved, setSaved] = useState(false);

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const savePreferences = () => {
    try {
      localStorage.setItem(
        "travelmint-preferences",
        JSON.stringify(preferences)
      );
      setSaved(true);
    } catch (err) {
      console.error("Couldn't save preferences:", err);
      setSaved(false);
      alert("Your preferences couldn't be saved in this browser.");
    }
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    setSaved(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <div className="settings-background" aria-hidden="true" />
      <Navbar />

      <main className="settings-page">
        <header className="settings-hero">
          <span className="eyebrow">MAKE TRAVELMINT YOURS</span>
          <h1>
            The details
            <br />
            <em>that make it yours.</em>
          </h1>
          <p>
            Set your preferences for a more personal travel-planning
            experience.
          </p>
        </header>

        <div className="settings-layout">
          <aside className="settings-sidebar">
            <span className="settings-sidebar-label">YOUR ACCOUNT</span>

            <a href="#profile" className="settings-side-link active">
              <span>01</span> Profile
            </a>
            <a href="#preferences" className="settings-side-link">
              <span>02</span> Preferences
            </a>
            <a href="#notifications" className="settings-side-link">
              <span>03</span> Notifications
            </a>
            <a href="#appearance" className="settings-side-link">
              <span>04</span> Appearance
            </a>

            <div className="settings-sidebar-note">
              <span className="settings-note-mark">✳</span>
              <p>
                Every great journey begins with knowing what matters to you.
              </p>
            </div>
          </aside>

          <div className="settings-content">
            <section className="settings-panel" id="profile">
              <div className="settings-panel-heading">
                <div>
                  <span className="eyebrow">01 / YOUR IDENTITY</span>
                  <h2>Your profile<span>.</span></h2>
                  <p>How you appear in your TravelMint experience.</p>
                </div>
              </div>

              <div className="settings-profile-card">
                <span className="settings-avatar">
                  {username.charAt(0).toUpperCase()}
                </span>
                <div>
                  <strong>{username}</strong>
                  <span>TravelMint traveller</span>
                </div>
                <span className="settings-profile-status">
                  <span /> Active
                </span>
              </div>

              <p className="settings-helper">
                Your displayed name comes from your current account
                information. Profile editing can be added when an account
                update endpoint is available.
              </p>
            </section>

            <section className="settings-panel" id="preferences">
              <div className="settings-panel-heading">
                <div>
                  <span className="eyebrow">02 / TRAVEL YOUR WAY</span>
                  <h2>Preferences<span>.</span></h2>
                  <p>Choose how amounts and planning details appear.</p>
                </div>
              </div>

              <label className="settings-field">
                <span>
                  <strong>Display currency</strong>
                  <small>Currency used for preference displays.</small>
                </span>
                <select
                  value={preferences.currency}
                  onChange={(event) =>
                    updatePreference("currency", event.target.value)
                  }
                >
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="JPY">JPY — Japanese Yen</option>
                </select>
              </label>

              <p className="settings-helper">
                This preference is saved in your browser. Your existing
                trip and expense pages currently format amounts in INR.
              </p>
            </section>

            <section className="settings-panel" id="notifications">
              <div className="settings-panel-heading">
                <div>
                  <span className="eyebrow">03 / STAY IN THE LOOP</span>
                  <h2>Notifications<span>.</span></h2>
                  <p>Choose the reminders you'd like to enable as preferences.</p>
                </div>
              </div>

              <div className="settings-toggle-row">
                <span>
                  <strong>Trip reminders</strong>
                  <small>Preference for reminders about upcoming journeys.</small>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.tripReminders}
                  className={`settings-switch ${preferences.tripReminders ? "on" : ""}`}
                  onClick={() =>
                    updatePreference("tripReminders", !preferences.tripReminders)
                  }
                >
                  <span />
                </button>
              </div>

              <div className="settings-toggle-row">
                <span>
                  <strong>Budget alerts</strong>
                  <small>Preference for notices about trip spending.</small>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.budgetAlerts}
                  className={`settings-switch ${preferences.budgetAlerts ? "on" : ""}`}
                  onClick={() =>
                    updatePreference("budgetAlerts", !preferences.budgetAlerts)
                  }
                >
                  <span />
                </button>
              </div>

              <div className="settings-toggle-row">
                <span>
                  <strong>Travel inspiration</strong>
                  <small>Preference for travel ideas and updates.</small>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.travelUpdates}
                  className={`settings-switch ${preferences.travelUpdates ? "on" : ""}`}
                  onClick={() =>
                    updatePreference("travelUpdates", !preferences.travelUpdates)
                  }
                >
                  <span />
                </button>
              </div>

              <p className="settings-helper">
                These switches currently save your preferences only.
                They do not send notifications until a notification service
                is connected.
              </p>
            </section>

            <section className="settings-panel" id="appearance">
              <div className="settings-panel-heading">
                <div>
                  <span className="eyebrow">04 / YOUR SPACE</span>
                  <h2>Appearance<span>.</span></h2>
                  <p>Choose your preferred interface style.</p>
                </div>
              </div>

              <div className="settings-appearance-options">
                <button
                  type="button"
                  className={`settings-appearance-card ${
                    preferences.appearance === "light" ? "selected" : ""
                  }`}
                  onClick={() => updatePreference("appearance", "light")}
                >
                  <span className="settings-theme-preview light-preview">
                    <span />
                    <span />
                    <span />
                  </span>
                  <strong>Editorial light</strong>
                  <small>Warm ivory and forest green</small>
                </button>

                <button
                  type="button"
                  className={`settings-appearance-card ${
                    preferences.appearance === "dark" ? "selected" : ""
                  }`}
                  onClick={() => updatePreference("appearance", "dark")}
                >
                  <span className="settings-theme-preview dark-preview">
                    <span />
                    <span />
                    <span />
                  </span>
                  <strong>Deep forest</strong>
                  <small>Dark interface preference</small>
                </button>
              </div>

              <p className="settings-helper">
                The selected appearance is saved as a preference. A full
                application-wide theme will require connecting this setting
                to the app's global styles.
              </p>
            </section>

            <section className="settings-panel settings-account-panel">
              <div className="settings-panel-heading">
                <div>
                  <span className="eyebrow">ACCOUNT</span>
                  <h2>Account actions<span>.</span></h2>
                  <p>Sign out of your current session on this device.</p>
                </div>
              </div>
              <button
                type="button"
                className="settings-logout-button"
                onClick={logout}
              >
                Sign out <span aria-hidden="true">↗</span>
              </button>
            </section>

            <div className="settings-save-bar">
              <button
                type="button"
                className="settings-reset-button"
                onClick={resetPreferences}
              >
                Reset changes
              </button>
              <div>
                {saved && (
                  <span className="settings-saved-message" role="status">
                    Preferences saved
                  </span>
                )}
                <button
                  type="button"
                  className="settings-save-button"
                  onClick={savePreferences}
                >
                  Save preferences <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="settings-footer">
          <span>TRAVELMINT®</span>
          <span>Make room for what moves you.</span>
          <span>TRAVEL WITH INTENTION.</span>
        </footer>
      </main>
    </>
  );
}

export default Settings;
