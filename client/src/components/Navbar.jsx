
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const username =
    localStorage.getItem("username") ||
    localStorage.getItem("name") ||
    "Traveller";

  const email = localStorage.getItem("email") || "";
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const goTo = (path) => {
    navigate(path);
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      label: "My Trips",
      path: "/trips",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
          <circle cx="12" cy="9" r="2.3" />
        </svg>
      ),
    },
  ];

  const isTripDetailsPage = /^\/trips\/[^/]+$/.test(location.pathname);
  const visibleLinks = links;

  const settingsIcon = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 13.5a7 7 0 0 0 0-3l2-1.5-2-3.5-2.3.8a7 7 0 0 0-2.6-1.5L13.7 2h-3.4l-.4 2.8a7 7 0 0 0-2.6 1.5L5 5.5 3 9l2 1.5a7 7 0 0 0 0 3L3 15l2 3.5 2.3-.8a7 7 0 0 0 2.6 1.5l.4 2.8h3.4l.4-2.8a7 7 0 0 0 2.6-1.5l2.3.8 2-3.5-2-1.5Z" />
    </svg>
  );

  const helpIcon = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.1 1-1.8 1.4-1.8 2.7" />
      <path d="M12 17h.01" />
    </svg>
  );

  const logoutIcon = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </svg>
  );

  return (
    <header className={`travel-navbar-shell ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="travel-navbar" aria-label="Main navigation">
        <button
          type="button"
          className="travel-brand"
          onClick={() => goTo("/dashboard")}
          aria-label="TravelMint home"
        >
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M4 24 13 7l6 11 3-5 6 11H4Z" />
              <path d="m11 13 2 3 2-2" />
            </svg>
          </span>
          <span className="brand-name">TravelMint</span>
        </button>

        <div className="navbar-links">
          {visibleLinks.map((link) => (
            <button
              key={link.path}
              type="button"
              className={`navbar-link ${isActive(link.path) ? "active" : ""}`}
              onClick={() => goTo(link.path)}
              aria-current={isActive(link.path) ? "page" : undefined}
            >
              <span className="navbar-link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          <div className="navbar-profile-wrap">
            <button
              type="button"
              className={`navbar-profile ${profileOpen ? "profile-open" : ""}`}
              onClick={() => {
                setProfileOpen((current) => !current);
                setMobileOpen(false);
              }}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <span className="profile-avatar">{initial}</span>
              <span className="profile-name">{username}</span>
              <svg className="profile-chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>

            {profileOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="profile-dropdown-header">
                  <span className="profile-avatar">{initial}</span>
                  <div className="profile-dropdown-user">
                    <strong>{username}</strong>
                    <span>{email || "TravelMint account"}</span>
                  </div>
                </div>

                <div className="profile-dropdown-divider" />

                <button
                  type="button"
                  className="profile-dropdown-item"
                  role="menuitem"
                  onClick={() => goTo("/settings")}
                >
                  {settingsIcon}
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  className="profile-dropdown-item"
                  role="menuitem"
                  onClick={() => goTo("/help")}
                >
                  {helpIcon}
                  <span>Help & Support</span>
                </button>

                <div className="profile-dropdown-divider" />

                <button
                  type="button"
                  className="profile-dropdown-item profile-logout"
                  role="menuitem"
                  onClick={logout}
                >
                  {logoutIcon}
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => {
              setMobileOpen((current) => !current);
              setProfileOpen(false);
            }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-nav-panel">
          {visibleLinks.map((link) => (
            <button
              key={link.path}
              type="button"
              className={`mobile-nav-link ${isActive(link.path) ? "active" : ""}`}
              onClick={() => goTo(link.path)}
            >
              <span className="mobile-nav-icon">{link.icon}</span>
              <span>{link.label}</span>
              <span className="mobile-nav-arrow">↗</span>
            </button>
          ))}

          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => goTo("/settings")}
          >
            <span className="mobile-nav-icon">{settingsIcon}</span>
            <span>Settings</span>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => goTo("/help")}
          >
            <span className="mobile-nav-icon">{helpIcon}</span>
            <span>Help & Support</span>
          </button>

          <div className="mobile-nav-footer">
            <span className="profile-avatar">{initial}</span>
            <div>
              <strong>{username}</strong>
              <span>{email || "TravelMint account"}</span>
            </div>
            <button type="button" onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
