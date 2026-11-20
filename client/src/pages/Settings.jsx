
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/api";
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

const [profile, setProfile] = useState({
  name:
    localStorage.getItem("username") ||
    localStorage.getItem("name") ||
    "Traveller",
  email: localStorage.getItem("email") || "",
});

const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [preferences, setPreferences] = useState(readPreferences);
  const [saved, setSaved] = useState(false);

  // Apply selected theme
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      preferences.appearance === "dark" ? "dark" : "light"
    );
  }, [preferences.appearance]);


  // Update profile name
  const handleProfileUpdate = async (event) => {
    event.preventDefault();

    if (!editName.trim()) {
      setProfileMessage("Name cannot be empty.");
      return;
    }

    try {
      setProfileSaving(true);
      setProfileMessage("");

      const res = await api.put("/auth/me", {
        name: editName.trim(),
      });

      const updatedUser = res.data.user;

      setProfile({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      localStorage.setItem("username", updatedUser.name);
      setEditName(updatedUser.name);
      setEditingProfile(false);
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileMessage(
        err.response?.data?.message || "Unable to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // Change password
  const handlePasswordChange = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);

      const res = await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordMessage(
        res.data.message || "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Unable to change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  // Save preferences
  const savePreferences = () => {
    try {
      localStorage.setItem(
        "travelmint-preferences",
        JSON.stringify(preferences)
      );

      document.documentElement.setAttribute(
        "data-theme",
        preferences.appearance
      );

      setSaved(true);
    } catch (err) {
      console.error("Couldn't save preferences:", err);
      setSaved(false);
      alert("Your preferences couldn't be saved in this browser.");
    }
  };

  // Reset preferences
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    setSaved(false);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    navigate("/login", { replace: true });
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
            {/* PROFILE */}
            <section className="settings-panel" id="profile">
              <div className="settings-panel-heading">
                <div>
                  <span className="eyebrow">01 / YOUR IDENTITY</span>
                  <h2>Your profile<span>.</span></h2>
                  <p>Manage your personal TravelMint account information.</p>
                </div>
              </div>

              <div className="settings-profile-card">
                <span className="settings-avatar">
                  {(profile.name || "T").charAt(0).toUpperCase()}
                </span>

                <div>
                  <strong>
                    {profileLoading ? "Loading profile..." : profile.name}
                  </strong>
                  <span>{profile.email || "TravelMint traveller"}</span>
                </div>

                <span className="settings-profile-status">
                  <span /> Active
                </span>
              </div>

              {profileError && (
                <p className="settings-helper" role="alert">
                  {profileError}
                </p>
              )}

              {profileMessage && (
                <p className="settings-feedback" role="status">
                  {profileMessage}
                </p>
              )}

              {!editingProfile ? (
                <div className="settings-profile-actions">
                  <button
                    type="button"
                    className="settings-edit-button"
                    disabled={profileLoading}
                    onClick={() => {
                      setEditName(profile.name);
                      setProfileMessage("");
                      setEditingProfile(true);
                    }}
                  >
                    Edit profile <span>↗</span>
                  </button>
                </div>
              ) : (
                <form
                  className="settings-edit-form"
                  onSubmit={handleProfileUpdate}
                >
                  <label className="settings-edit-field">
                    <span>Full name</span>
                    <input
                      type="text"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      placeholder="Enter your full name"
                      maxLength={80}
                      required
                    />
                  </label>

                  <label className="settings-edit-field">
                    <span>Email address</span>
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                    />
                    <small>
                      Email changes are currently unavailable because
                      verification is not configured.
                    </small>
                  </label>

                  <div className="settings-form-actions">
                    <button
                      type="button"
                      className="settings-reset-button"
                      onClick={() => {
                        setEditingProfile(false);
                        setEditName(profile.name);
                        setProfileMessage("");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="settings-save-button"
                      disabled={profileSaving}
                    >
                      {profileSaving ? "Saving..." : "Save profile ↗"}
                    </button>
                  </div>
                </form>
              )}

              <div className="settings-security">
                <div>
                  <strong>Password & security</strong>
                  <small>Keep your TravelMint account secure.</small>
                </div>

                <button
                  type="button"
                  className="settings-edit-button"
                  onClick={() => {
                    setShowPasswordForm((current) => !current);
                    setPasswordError("");
                    setPasswordMessage("");
                  }}
                >
                  {showPasswordForm ? "Cancel" : "Change password"}
                </button>
              </div>

              {showPasswordForm && (
                <form
                  className="settings-edit-form"
                  onSubmit={handlePasswordChange}
                >
                  <label className="settings-edit-field">
                    <span>Current password</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label className="settings-edit-field">
                    <span>New password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label className="settings-edit-field">
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  {passwordError && (
                    <p className="settings-feedback error" role="alert">
                      {passwordError}
                    </p>
                  )}

                  {passwordMessage && (
                    <p className="settings-feedback" role="status">
                      {passwordMessage}
                    </p>
                  )}

                  <div className="settings-form-actions">
                    <button
                      type="submit"
                      className="settings-save-button"
                      disabled={passwordSaving}
                    >
                      {passwordSaving ? "Updating..." : "Update password ↗"}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* PREFERENCES */}
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
                Your currency preference is saved in this browser. Existing
                trip and expense pages may still display INR.
              </p>
            </section>

            {/* NOTIFICATIONS */}
            <section className="settings-panel" id="notifications">
              <div className="settings-panel-heading">
                <div>
                  <span className="eyebrow">03 / STAY IN THE LOOP</span>
                  <h2>Notifications<span>.</span></h2>
                  <p>
                    Choose the reminders you'd like to enable as preferences.
                  </p>
                </div>
              </div>

              {[
                {
                  key: "tripReminders",
                  title: "Trip reminders",
                  description:
                    "Preference for reminders about upcoming journeys.",
                },
                {
                  key: "budgetAlerts",
                  title: "Budget alerts",
                  description:
                    "Preference for notices about trip spending.",
                },
                {
                  key: "travelUpdates",
                  title: "Travel inspiration",
                  description:
                    "Preference for travel ideas and updates.",
                },
              ].map((item) => (
                <div className="settings-toggle-row" key={item.key}>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-label={item.title}
                    aria-checked={preferences[item.key]}
                    className={`settings-switch ${
                      preferences[item.key] ? "on" : ""
                    }`}
                    onClick={() =>
                      updatePreference(item.key, !preferences[item.key])
                    }
                  >
                    <span />
                  </button>
                </div>
              ))}

              <p className="settings-helper">
                These switches save your preferences only. They do not send
                notifications until a notification service is connected.
              </p>
            </section>

            {/* APPEARANCE */}
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
                Your selected theme is applied throughout the application
                and restored when you reopen it.
              </p>
            </section>

            {/* ACCOUNT ACTIONS */}
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

            {/* SAVE BAR */}
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
