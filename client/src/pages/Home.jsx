
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main className="public-home">
      <div className="public-hero-shell">
        <header className="public-nav">
          <Link to="/" className="public-brand">
            <span className="public-brand-mark">✳</span>
            TravelMint
          </Link>

          <nav className="public-nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#trip-planning">Explore</a>
          </nav>

          <div className="public-nav-actions">
            <Link to="/login" className="public-signin">
              Sign in
            </Link>
            <Link to="/register" className="public-get-started">
              Get started <span>↗</span>
            </Link>
          </div>
        </header>

        <div className="public-hero-art">
          <img
            src="/images/hero-mountain-lake.png"
            alt="Mountain lake surrounded by alpine peaks"
            className="public-hero-image"
          />
          <div className="public-image-overlay" aria-hidden="true" />
          <div className="public-art-label">
          </div>
        </div>

        <section className="public-hero">
          <div className="public-hero-content">
            <span className="public-eyebrow">
              <span className="public-eyebrow-dot" />
              YOUR JOURNEY, BEAUTIFULLY ORGANIZED
            </span>

            <h1>
              Go further.
              <br />
              <span>Wander smarter.</span>
            </h1>

            <p className="public-hero-description">
              From the first spark of inspiration to the journey home,
              make every trip more thoughtful, effortless and yours.
            </p>

            <div className="public-hero-actions">
              <Link to="/register" className="public-primary-button">
                Start your journey <span>↗</span>
              </Link>
              <a href="#features" className="public-secondary-button">
                Discover TravelMint <span>↓</span>
              </a>
            </div>

            <div className="public-quick-features">
              <div>
                <span aria-hidden="true">▦</span>
                Plan trips
              </div>
              <div>
                <span aria-hidden="true">▱</span>
                Track expenses
              </div>
              <div>
                <span aria-hidden="true">✧</span>
                Get AI recommendations
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="public-features" id="features">
        <div className="public-features-heading">
          <div>
            <br>    

            
            
            </br>
            <span className="public-section-label">THE TRAVELMINT EXPERIENCE</span>
            <h2>
              Everything you need.
              <br />
              <span>One beautiful place.</span>
            </h2>
          </div>
          <p>
            A little more clarity before you go.
            A lot more room to enjoy the journey.
          </p>
        </div>

        <div className="public-feature-grid">
          <article className="public-feature-card">
            <div className="public-feature-top">
              <span>01 / PLAN</span>
              <span className="public-feature-icon" aria-hidden="true">⌖</span>
            </div>
            <h3>Thoughtful trip planning</h3>
            <p>
              Bring your travel ideas together. Organize destinations, dates
              and every detail of your next adventure.
            </p>
            <a href="#trip-planning">Discover more <span>↗</span></a>
          </article>

          <article className="public-feature-card">
            <div className="public-feature-top">
              <span>02 / TRACK</span>
              <span className="public-feature-icon" aria-hidden="true">▱</span>
            </div>
            <h3>Smarter expense tracking</h3>
            <p>
              Keep your travel budget in check. Track expenses and understand
              where your money goes.
            </p>
            <a href="#expense-tracking">Discover more <span>↗</span></a>
          </article>

          <article className="public-feature-card">
            <div className="public-feature-top">
              <span>03 / DISCOVER</span>
              <span className="public-feature-icon" aria-hidden="true">✧</span>
            </div>
            <h3>AI-powered inspiration</h3>
            <p>
              Discover destinations and create travel plans that match your
              style and preferences.
            </p>
            <a href="#ai-planner">Discover more <span>↗</span></a>
          </article>
        </div>
      </section>

      <section className="public-intro" id="about">
        <span className="public-section-label">A BETTER WAY TO GET AWAY</span>
        <h2>
          Less time managing.
          <br />
          <span>More time discovering.</span>
        </h2>
        <p>
          Travel should feel like freedom, not another thing to organize.
          TravelMint brings your plans, spending and inspiration into one
          considered space.
        </p>
      </section>

      <section className="public-story-section" id="trip-planning">
        <div className="public-story-visual public-story-map">
          <div className="public-visual-topline">
            <span>YOUR NEXT ADVENTURE</span>
            <span>01 — PLAN</span>
          </div>

          <div className="public-map-art" aria-hidden="true">
            <div className="public-map-route" />
            <span className="public-map-pin pin-one">✳</span>
            <span className="public-map-pin pin-two">✳</span>
            <span className="public-map-pin pin-three">✳</span>
            <div className="public-map-note">
              <span>THE JOURNEY BEGINS</span>
              <strong>Somewhere wonderful.</strong>
            </div>
          </div>
        </div>

        <div className="public-story-copy">
          <span className="public-section-label">01 / PLAN WITH PURPOSE</span>
          <h2>
            Every journey
            <br />
            <span>starts with an idea.</span>
          </h2>
          <p>
            Keep your destinations, travel dates and plans organized in one
            place. Turn scattered ideas into journeys worth remembering.
          </p>
          <ul>
            <li>Organize trips and destinations</li>
            <li>Keep important travel details together</li>
            <li>See your upcoming adventures at a glance</li>
          </ul>
        </div>
      </section>

      <section className="public-story-section public-story-reverse" id="expense-tracking">
        <div className="public-story-visual public-expense-visual">
          <div className="public-visual-topline">
            <span>TRAVEL, MINDFULLY</span>
            <span>02 — TRACK</span>
          </div>

          <div className="public-expense-card">
            <span>YOUR TRAVEL EXPENSES</span>
            <strong>Stay on budget.</strong>
            <div className="public-expense-line">
              <span>Accommodation</span>
              <span>Track it</span>
            </div>
            <div className="public-expense-line">
              <span>Food &amp; dining</span>
              <span>Track it</span>
            </div>
            <div className="public-expense-line">
              <span>Transport</span>
              <span>Track it</span>
            </div>
            <div className="public-expense-bottom">
              Every expense has its place.
            </div>
          </div>
        </div>

        <div className="public-story-copy">
          <span className="public-section-label">02 / SPEND THOUGHTFULLY</span>
          <h2>
            More experiences.
            <br />
            <span>Less money stress.</span>
          </h2>
          <p>
            Travelling should be about the memories you make, not the confusion
            of managing your budget. Keep your spending clear and organized.
          </p>
          <ul>
            <li>Record your travel expenses</li>
            <li>Organize spending by category</li>
            <li>Understand your travel budget</li>
          </ul>
        </div>
      </section>

      <section className="public-story-section" id="ai-planner">
        <div className="public-story-visual public-ai-visual">
          <div className="public-visual-topline">
            <span>A LITTLE INSPIRATION</span>
            <span>03 — DISCOVER</span>
          </div>

          <div className="public-ai-card">
            <span className="public-ai-sparkle" aria-hidden="true">✧</span>
            <span>YOUR PERSONAL TRAVEL COMPANION</span>
            <h3>Dream it.<br />We&apos;ll help plan it.</h3>
            <p>
              Find inspiration for your next destination and shape a journey
              around your preferences.
            </p>
            <div className="public-ai-chip-row">
              <span>Adventure</span>
              <span>Culture</span>
              <span>Relaxation</span>
            </div>
          </div>
        </div>

        <div className="public-story-copy">
          <span className="public-section-label">03 / LET IDEAS TAKE FLIGHT</span>
          <h2>
            A little help
            <br />
            <span>from a smarter travel buddy.</span>
          </h2>
          <p>
            Have a destination in mind but not sure where to begin? Explore
            AI-powered travel suggestions and find ideas that fit your travel
            style.
          </p>
          <ul>
            <li>Discover personalized travel ideas</li>
            <li>Explore plans based on your preferences</li>
            <li>Find inspiration for your next getaway</li>
          </ul>
        </div>
      </section>

      <section className="public-cta">
        <span className="public-section-label">
          YOUR NEXT CHAPTER STARTS HERE
        </span>
        <h2>
          The world is waiting.
          <br />
          <span>Are you ready?</span>
        </h2>
        <p>
          Make room for new places, new experiences and journeys worth
          remembering.
        </p>
        <span className="public-cta-note">
          PLAN THOUGHTFULLY. TRAVEL FREELY.
        </span>
      </section>

      <footer className="public-footer">
        <Link to="/" className="public-brand">
          <span className="public-brand-mark">✳</span>
          TravelMint
        </Link>
        <span>TRAVEL WELL. SPEND THOUGHTFULLY.</span>
      </footer>
    </main>
  );
}

export default Home;
