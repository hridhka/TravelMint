
import Navbar from "../components/Navbar";
import "./HelpSupport.css";

function HelpSupport() {
  return (
    <>
      <Navbar />

      <main className="help-support-page">
        <div className="help-support-container">
          <span className="help-eyebrow">TRAVELMINT SUPPORT</span>

          <h1>How can we help?</h1>

          <p className="help-intro">
            Need a little guidance? Find answers to common questions
            about using TravelMint.
          </p>

          <section className="help-card">
            <h2>Frequently Asked Questions</h2>

            <details>
              <summary>How do I create a trip?</summary>
              <p>
                Go to your Dashboard and select the option to create a new trip. Enter your destination, travel dates, budget and preferences to plan your journey. You can also use the AI Trip Planner to generate personalized travel options.
              </p>
            </details>

            <details>
              <summary>Where can I find my saved trips?</summary>
              <p>
                Navigate to the My Trips section from the navbar to view all your saved trips. Select any trip to explore its details, itinerary, budget and other travel information.
              </p>
            </details>

            <details>
              <summary>How can I manage my expenses?</summary>
              <p>
                Open your trip and navigate to its expense section to add and track your spending. You can record expenses, organize them by category and monitor your overall trip budget.
              </p>
            </details>

            <details>
              <summary>How do I change my account details?</summary>
              <p>
                Open Settings from your profile dropdown to access your account preferences. You can update your profile name, change your password and manage your preferences and notifications.
              </p>
            </details>
          </section>
        </div>
      </main>
    </>
  );
}

export default HelpSupport;
