
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api/api";
import Navbar from "../components/Navbar";
import NewTripModal from "../components/NewTripModal";
import "./Dashboard.css";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const sections = [
  {
    id: "destinations",
    number: "01",
    title: "Destinations",
    subtitle: "Places that stay with you.",
    description:
      "Explore iconic cities, remote landscapes, hidden gems and unforgettable local experiences.",
    topics: ["Popular places", "Hidden gems", "Things to do", "Local experiences"],
    contentLabel: "FIND YOUR KIND OF PLACE",
    content: [
      { title: "Coastal escapes", detail: "Island stays, quiet beaches and waterfront towns for slow, sun-filled days." },
      { title: "Mountain retreats", detail: "Fresh air, scenic trails and peaceful stays surrounded by nature." },
      { title: "Culture-rich cities", detail: "Historic streets, architecture, museums and neighbourhoods full of character." },
      { title: "Offbeat discoveries", detail: "Smaller towns and lesser-known spots for a different kind of journey." },
    ],
  },
  {
    id: "guides",
    number: "02",
    title: "Travel Guides",
    subtitle: "Know before you go.",
    description:
      "Get familiar with a destination through practical guides, local insights and essential information.",
    topics: ["City guides", "Country guides", "First-time travel", "Local customs"],
    contentLabel: "THE DETAILS BEFORE DEPARTURE",
    content: [
      { title: "Know the neighbourhoods", detail: "Understand which areas suit sightseeing, food, nightlife or a quieter stay." },
      { title: "Plan your days", detail: "Group nearby attractions together and leave room for spontaneous detours." },
      { title: "Getting around", detail: "Compare public transport, walking routes, taxis and intercity connections." },
      { title: "Local etiquette", detail: "Learn useful phrases, dress expectations and customs to be respectful." },
    ],
  },
  {
    id: "culture",
    number: "03",
    title: "Food & Culture",
    subtitle: "Discover the world through its culture.",
    description:
      "Learn about regional cuisines, traditional dishes, festivals, heritage and everyday local life.",
    topics: ["Local cuisines", "Street food", "Festivals", "Traditions"],
    contentLabel: "TASTE AND EXPERIENCE A PLACE",
    content: [
      { title: "Must-try dishes", detail: "Make room for regional specialities and the dishes locals grew up with." },
      { title: "Street-food trails", detail: "Explore markets and food streets, choosing busy stalls with good food-safety practices." },
      { title: "Festivals and celebrations", detail: "Discover seasonal events, music, art and celebrations that bring communities together." },
      { title: "Everyday culture", detail: "Notice local crafts, markets, music and the small rituals of daily life." },
    ],
  },
  {
    id: "tips",
    number: "04",
    title: "Travel Tips",
    subtitle: "Travel with confidence.",
    description:
      "Prepare for your journey with useful advice for packing, safety, solo travel and managing your budget.",
    topics: ["Packing lists", "Travel safety", "Solo travel", "Budget travel"],
    contentLabel: "FEEL PREPARED, NOT OVERPACKED",
    content: [
      { title: "Pack with purpose", detail: "Build a compact list around the weather, activities, trip length and baggage limits." },
      { title: "Stay travel-aware", detail: "Keep emergency contacts handy, protect valuables and check local safety guidance." },
      { title: "Make a realistic budget", detail: "Set aside money for transport, meals, stays, activities and unexpected costs." },
      { title: "Travel solo with confidence", detail: "Share your itinerary with someone you trust and plan your arrival before you leave." },
    ],
  },
  {
    id: "weather",
    number: "05",
    title: "Weather & Seasons",
    subtitle: "Find the right moment to go.",
    description:
      "Understand seasonal conditions, ideal travel periods and what to expect from the weather.",
    topics: ["Best time to visit", "Seasonal guides", "Climate", "Travel conditions"],
    contentLabel: "CHOOSE YOUR MOMENT",
    content: [
      { title: "Peak season", detail: "Expect lively attractions and more services, alongside higher prices and crowds." },
      { title: "Shoulder season", detail: "A possible balance of milder crowds, comfortable conditions and better value." },
      { title: "Off-season", detail: "Find quieter experiences, but check closures, reduced transport and local weather risks." },
      { title: "Before you book", detail: "Check destination-specific forecasts and advisories close to your travel dates." },
    ],
  },
  {
    id: "essentials",
    number: "06",
    title: "Travel Essentials",
    subtitle: "The details that make a difference.",
    description:
      "Learn about visas, currencies, transportation, connectivity and other practical travel essentials.",
    topics: ["Visa information", "Currency", "Transport", "SIM & connectivity"],
    contentLabel: "THE PRACTICAL CHECKLIST",
    content: [
      { title: "Documents and entry rules", detail: "Check passport validity, visa requirements and entry documents using official sources." },
      { title: "Money matters", detail: "Understand local currency, card acceptance, ATM fees and a sensible cash backup." },
      { title: "Getting connected", detail: "Compare roaming, local SIM cards and eSIM plans before you travel." },
      { title: "Bookings and backups", detail: "Keep copies of reservations, insurance details and important documents accessible offline." },
    ],
  },
  {
    id: "recommendations",
    number: "07",
    title: "Personal Recommendations",
    subtitle: "A journey that feels like yours.",
    description:
      "Explore ideas based on the experiences you enjoy, from adventure and culture to relaxation.",
    topics: ["Adventure", "Culture", "Nature", "Relaxation"],
    contentLabel: "SHAPE A JOURNEY AROUND YOU",
    content: [
      { title: "For the curious explorer", detail: "Build a trip around walking tours, local neighbourhoods and new experiences." },
      { title: "For the outdoorsy traveller", detail: "Look for trails, coastlines, wildlife experiences and time in nature." },
      { title: "For the slow traveller", detail: "Choose fewer stops, longer stays and unhurried days to settle into a place." },
      { title: "For the culture seeker", detail: "Prioritise food, heritage, creative spaces and conversations with local guides." },
    ],
  },
];

const suggestions = [
  "Best places to visit on a budget",
  "Plan a first solo trip",
  "Best time to visit Japan",
];

const journalEditorialNotes = {
  guides: {
    kicker: "THE ART OF ARRIVING WELL",
    intro: "A good trip starts long before the first photograph. Learn the shape of a place, then give yourself room to experience it.",
    quote: "The best way to know a city is to understand how its neighbourhoods fit together.",
    closing: "A little preparation gives you more freedom once you arrive."
  },
  culture: {
    kicker: "A PLACE IS MORE THAN ITS LANDMARKS",
    intro: "Food, traditions and everyday rituals reveal the personality of a destination. Approach them with curiosity, respect and an appetite for discovery.",
    quote: "Follow the local flavours. They often tell the most honest story.",
    closing: "Be curious, ask before photographing people, and respect customs that are unfamiliar to you."
  },
  tips: {
    kicker: "CONFIDENCE COMES FROM PREPARATION",
    intro: "Thoughtful planning does not make a journey rigid. It gives you the confidence to handle the unexpected and enjoy the moments you did not plan.",
    quote: "Pack for the trip you are taking, not every trip you can imagine.",
    closing: "Keep your plans flexible, your essentials accessible and a little room in the budget for surprises."
  },
  weather: {
    kicker: "TIMING CHANGES THE WHOLE EXPERIENCE",
    intro: "The same destination can feel completely different across the year. Think beyond temperature: rainfall, daylight, local holidays and seasonal closures all matter.",
    quote: "Choose the season that suits the experience you want.",
    closing: "Check forecasts and local advisories again close to departure; seasonal averages are only a starting point."
  },
  essentials: {
    kicker: "THE SMALL DETAILS THAT KEEP A TRIP MOVING",
    intro: "Documents, payments and connectivity are easy to overlook when you are excited about the destination. Sort the essentials early so they do not interrupt the journey.",
    quote: "A backup plan is not pessimism. It is peace of mind.",
    closing: "Use official government and provider sources for current entry rules, fees and travel requirements."
  },
  recommendations: {
    kicker: "MAKE THE JOURNEY YOURS",
    intro: "There is no single right way to travel. The best itinerary reflects your pace, interests and the kind of memories you want to bring home.",
    quote: "Build a trip around what makes you feel most alive.",
    closing: "Choose a few meaningful priorities, then leave enough space for unexpected discoveries."
  }
};


const destinations = [
  {
    id: 1,
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    dailyBudget: 3500,
    season: "April – October",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=85",
    description: "A tropical escape of lush rice terraces, beautiful beaches, temples and vibrant island culture.",
    highlights: ["Ubud Rice Terraces", "Uluwatu Temple", "Nusa Penida", "Seminyak Beach"],
    bestFor: "Beaches, nature and relaxation",
  },
  {
    id: 2,
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    dailyBudget: 6500,
    season: "March – May, October – November",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=85",
    description: "Discover traditional Japanese architecture, peaceful gardens, historic temples and beautiful seasonal scenery.",
    highlights: ["Fushimi Inari Shrine", "Arashiyama", "Kiyomizu-dera", "Gion District"],
    bestFor: "Culture, history and food",
  },
  {
    id: 3,
    name: "Amalfi Coast",
    country: "Italy",
    region: "Europe",
    dailyBudget: 14000,
    season: "May – September",
    image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=1000&q=85",
    description: "A spectacular coastline filled with colourful villages, Mediterranean food and dramatic sea views.",
    highlights: ["Positano", "Amalfi", "Ravello", "Path of the Gods"],
    bestFor: "Coastal escapes and romantic trips",
  },
  {
    id: 4,
    name: "Swiss Alps",
    country: "Switzerland",
    region: "Europe",
    dailyBudget: 18000,
    season: "June – September, December – March",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1000&q=85",
    description: "Experience breathtaking mountain landscapes, alpine villages, scenic railways and outdoor adventures.",
    highlights: ["Zermatt", "Jungfraujoch", "Interlaken", "Grindelwald"],
    bestFor: "Adventure, mountains and nature",
  },
  {
    id: 5,
    name: "Munnar",
    country: "India",
    region: "India",
    dailyBudget: 2500,
    season: "September – March",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=85",
    description: "Escape into rolling tea plantations, misty hills, waterfalls and the peaceful landscapes of Kerala.",
    highlights: ["Tea Museum", "Eravikulam National Park", "Mattupetty Dam", "Top Station"],
    bestFor: "Nature, relaxation and road trips",
  },
  {
    id: 6,
    name: "Jaipur",
    country: "India",
    region: "India",
    dailyBudget: 3000,
    season: "October – March",
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=85",
    description: "Explore royal palaces, colourful bazaars, historic forts and the rich heritage of Rajasthan.",
    highlights: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar"],
    bestFor: "Heritage, architecture and culture",
  },
  {
    id: 7,
    name: "Istanbul",
    country: "Turkey",
    region: "Middle East",
    dailyBudget: 7500,
    season: "April – May, September – October",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=85",
    description: "A fascinating meeting point of continents, with historic architecture, lively markets and unforgettable cuisine.",
    highlights: ["Hagia Sophia", "Blue Mosque", "Grand Bazaar", "Bosphorus"],
    bestFor: "History, food and city exploration",
  },
  {
    id: 8,
    name: "Maldives",
    country: "Maldives",
    region: "Asia",
    dailyBudget: 12000,
    season: "November – April",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1000&q=85",
    description: "Enjoy turquoise waters, white-sand beaches, coral reefs and peaceful island experiences.",
    highlights: ["Maafushi", "Malé", "Banana Reef", "Island excursions"],
    bestFor: "Beaches, diving and relaxation",
  },
];

const destinationExperiences = {
  1: ["Explore Ubud's rice terraces", "Visit cliffside temples", "Spend time on beaches and coastal villages"],
  2: ["Walk through Fushimi Inari's torii gates", "Explore Arashiyama Bamboo Grove", "Discover traditional streets in Gion"],
  3: ["Explore Positano's colourful streets", "Take in the views from Ravello", "Walk scenic coastal paths"],
  4: ["Ride scenic mountain railways", "Explore alpine villages", "Hike trails around the mountain lakes"],
  5: ["Visit tea plantations", "Explore Eravikulam National Park", "Enjoy waterfalls and scenic hill drives"],
  6: ["Explore Amber Fort and City Palace", "Visit the Hawa Mahal", "Discover Jaipur's traditional bazaars"],
  7: ["Visit Hagia Sophia and the Blue Mosque", "Explore the Grand Bazaar", "Take a Bosphorus waterfront walk"],
  8: ["Relax on white-sand beaches", "Explore coral reefs and marine life", "Take a local island excursion"],
};

function Dashboard() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [question, setQuestion] = useState("");
  const [aiNotice, setAiNotice] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [activeDestinationIndex, setActiveDestinationIndex] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [activeJournalIndex, setActiveJournalIndex] = useState(0);

  const journalSections = sections.filter(
    (section) => section.id !== "destinations"
  );
  const activeJournal = journalSections[activeJournalIndex];

  const openDestinationDetails = (destination) => {
    setSelectedDestination(destination);
  };

  const closeDestinationDetails = () => {
    setSelectedDestination(null);
  };

  const activeDestination = destinations[activeDestinationIndex];

  const nextDestination = () => {
    setActiveDestinationIndex(
      (current) => (current + 1) % destinations.length
    );
  };

  const previousDestination = () => {
    setActiveDestinationIndex(
      (current) =>
        (current - 1 + destinations.length) % destinations.length
    );
  };

  useEffect(() => {
    if (!selectedDestination) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedDestination(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDestination]);

  // Reveal editorial sections as they enter the viewport.
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) =>
        element.classList.add("is-visible")
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const fetchTrips = async () => {
    try {
      setFetchError("");
      const res = await api.get("/trips");
      setTrips(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
      setFetchError("We couldn't load your travel overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const createTrip = async (e) => {
    e.preventDefault();

    try {
      await api.post("/trips", {
        title,
        budget,
        start_date: startDate,
        end_date: endDate,
      });

      setTitle("");
      setBudget("");
      setStartDate("");
      setEndDate("");
      setOpenModal(false);
      await fetchTrips();
    } catch (err) {
      console.error("Failed to create trip:", err);
      alert("Couldn't create your trip. Please try again.");
    }
  };

  const totalBudget = trips.reduce(
    (sum, trip) => sum + Number(trip.budget || 0),
    0
  );

  const totalSpent = trips.reduce(
    (sum, trip) => sum + Number(trip.total_spent || 0),
    0
  );

  const remainingBudget = totalBudget - totalSpent;

  const overBudgetCount = trips.filter(
    (trip) =>
      Number(trip.total_spent || 0) > Number(trip.budget || 0)
  ).length;

  const handleQuestionSubmit = (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    navigate("/ai-assistant", {
      state: {
        initialQuestion: trimmedQuestion,
      },
    });
  };

  return (
    <>
      <div
        className="dashboard-hero-background"
        aria-hidden="true"
      />

      <Navbar />

      <main className="dashboard-container">
        {/* CINEMATIC MAGAZINE COVER */}
        <section className="editorial-hero">
          <div className="hero-copy">
            <h1 className="hero-title">
              Somewhere
              <br />
              <span>is calling.</span>
            </h1>

            <p>
              Discover the places, people and experiences that
              make this world extraordinary. Start with a question.
              Leave with a thousand possibilities.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="hero-link"
                onClick={() => setOpenModal(true)}
              >
                PLAN YOUR FIRST TRIP <span>↗</span>
              </button>

              <a href="#discover" className="hero-link">
                EXPLORE THE WORLD <span>↓</span>
              </a>
            </div>
          </div>

          <div className="hero-bottom">
            <span>01 — DISCOVER</span>
            <span>THE WORLD IS YOURS TO EXPLORE</span>
          </div>

          <span className="hero-scroll-indicator" aria-hidden="true">
            SCROLL TO EXPLORE
          </span>
        </section>

        {/* PERSONAL TRAVEL LEDGER */}
        {!loading && !fetchError && (
          <section
            className="ledger-section"
          
          >
          <div className="section-index">
            <span>02 / YOUR TRAVEL LEDGER</span>
            <span>YOUR JOURNEYS AT A GLANCE</span>
          </div>

          <div className="ledger-heading">
            <h2>
              Your journeys.
              <br />
              <em>Your numbers.</em>
            </h2>
          </div>

          {fetchError ? (
            <div className="dashboard-message" role="alert">
              <p>{fetchError}</p>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  fetchTrips();
                }}
              >
                Try again ↻
              </button>
            </div>
          ) : (
            <div className="ledger-grid">
              <article>
                <span>TOTAL JOURNEYS</span>
                <strong>{loading ? "—" : trips.length}</strong>
              </article>

              <article>
                <span>TOTAL BUDGET</span>
                <strong>
                  {loading ? "—" : formatCurrency(totalBudget)}
                </strong>
              </article>

              <article>
                <span>TOTAL SPENT</span>
                <strong>
                  {loading ? "—" : formatCurrency(totalSpent)}
                </strong>
              </article>

              <article>
                <span>BUDGET REMAINING</span>
                <strong>
                  {loading ? "—" : formatCurrency(remainingBudget)}
                </strong>
              </article>
            </div>
          )}

          {!loading && !fetchError && overBudgetCount > 0 && (
            <p className="ledger-alert">
              {overBudgetCount}{" "}
              {overBudgetCount === 1
                ? "journey is"
                : "journeys are"}{" "}
              currently over budget.
            </p>
          )}
          </section>
        )}

        {/* TRAVELMINT AI */}
        <section
          className="ai-section"
          id="ask-travelmint"
          data-reveal
        >
          <div className="section-index">
            <span>02 / YOUR TRAVEL COMPANION</span>
            <span>ASK TRAVELMINT AI</span>
          </div>

          <div className={`ai-layout ${aiAnswer || aiLoading || aiNotice ? "has-answer" : ""}`}>
            <div className="ai-heading">
              <h2>
                Every journey
                <br />
                begins with <em>a question.</em>
              </h2>

              <p>
                Curious about a destination? Need travel advice?
                Want to understand a culture? Start here.
              </p>
            </div>

            <div className="ai-interaction">
              <form onSubmit={handleQuestionSubmit}>
                <label htmlFor="travel-question">
                  WHAT WOULD YOU LIKE TO KNOW?
                </label>

                <div className="ai-input-wrap">
                  <input
                    id="travel-question"
                    type="text"
                    value={question}
                    onChange={(e) => {
                      setQuestion(e.target.value);
                      setAiNotice("");
                    }}
                    placeholder="Ask anything about travelling..."
                    maxLength={1500}
                    disabled={aiLoading}
                  />

                  <button
                    type="submit"
                    aria-label="Ask TravelMint AI"
                    disabled={aiLoading || !question.trim()}
                  >
                    {aiLoading ? "…" : "↗"}
                  </button>
                </div>
              </form>

              {aiLoading && (
                <p className="ai-loading" role="status" aria-live="polite">
                  TravelMint is thinking...
                </p>
              )}

              {aiNotice && (
                <p className="ai-notice" role="alert">
                  {aiNotice}
                </p>
              )}

              {aiAnswer && (
                <section className="ai-answer" aria-live="polite">
                  <div className="ai-answer-heading">
                    <span>TRAVELMINT / FIELD NOTES</span>
                    <span>AI TRAVEL GUIDE ↗</span>
                  </div>

                  <div className="ai-answer-question">
                    <span>YOUR QUESTION</span>
                    <p>{lastQuestion}</p>
                  </div>

                  <div className="ai-answer-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiAnswer}
                    </ReactMarkdown>
                  </div>
                </section>
              )}

              <div className="ai-suggestions">
                <span>PERHAPS START WITH</span>

                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuestion(item);
                      setAiNotice("");
                      setAiAnswer("");
                    }}
                  >
                    {item} ↗
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* EDITORIAL DISCOVERY */}
        <section
          className="discover-section"
          id="discover"
          data-reveal
        >
          

          {/* DESTINATION SHOWCASE */}
          <div className="journal-sections">
            <article
              className="journal-entry journal-entry-destinations"
              id="destinations"
              data-reveal
            >
              <div className="journal-entry-top">
                <span>01 / TRAVELMINT JOURNAL</span>
                <span>FIELD NOTES</span>
              </div>

              <div className="journal-entry-heading">
                <div>
                  <h3>Destinations</h3>
                  <p className="journal-subtitle">Places that stay with you.</p>
                </div>
                <span className="journal-entry-mark">↗</span>
              </div>

              <p className="journal-description">
                Explore iconic cities, remote landscapes, hidden gems and unforgettable local experiences.
              </p>

              <div className="destination-intro">
                <span>04 / FIND YOUR NEXT ESCAPE</span>
                <h2>
                  Somewhere worth <em>getting lost.</em>
                </h2>
                <p>
                  From quiet coastlines to mountain hideaways,
                  discover places that stay with you.
                </p>
              </div>

              <div
                className="destination-showcase"
                style={{
                  backgroundImage: `
                    linear-gradient(
                      90deg,
                      rgba(10, 20, 17, 0.76) 0%,
                      rgba(10, 20, 17, 0.40) 48%,
                      rgba(10, 20, 17, 0.12) 100%
                    ),
                    url("${activeDestination.image}")
                  `,
                }}
              >
                <div className="destination-showcase-content">
                  <div className="destination-showcase-copy">
                    <span className="destination-location">
                      {activeDestination.country} / {activeDestination.region}
                    </span>

                    <h2>{activeDestination.name}</h2>
                    <p>{activeDestination.description}</p>

                    <div className="destination-actions">
                      <button
                        type="button"
                        onClick={() => openDestinationDetails(activeDestination)}
                      >
                        VIEW DESTINATION
                      </button>
                    </div>

                    <div className="destination-controls">
                      <div className="destination-counter">
                        <strong>
                          {String(activeDestinationIndex + 1).padStart(2, "0")}
                        </strong>
                        <span>/ {String(destinations.length).padStart(2, "0")}</span>
                      </div>

                      <button
                        type="button"
                        onClick={previousDestination}
                        aria-label="Previous destination"
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        onClick={nextDestination}
                        aria-label="Next destination"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  <div className="destination-gallery">
                    {destinations
                      .map((destination, index) => ({ destination, index }))
                      .filter(({ index }) => index !== activeDestinationIndex)
                      .sort(
                        (a, b) =>
                          (a.index - activeDestinationIndex + destinations.length) %
                            destinations.length -
                          (b.index - activeDestinationIndex + destinations.length) %
                            destinations.length
                      )
                      .slice(0, 3)
                      .map(({ destination, index }) => (
                        <article
                          className="destination-gallery-card"
                          key={destination.id}
                        >
                          <button
                            type="button"
                            className="destination-gallery-image"
                            onClick={() => setActiveDestinationIndex(index)}
                            aria-label={`View ${destination.name}`}
                          >
                            <img
                              src={destination.image}
                              alt={`${destination.name}, ${destination.country}`}
                            />
                          </button>
                          <div className="destination-gallery-info">
                            <span>{destination.name}</span>
                          </div>
                        </article>
                      ))}
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* HORIZONTAL TRAVEL JOURNAL */}
          <section className="journal-index" aria-label="Travel journal categories">
            <div className="journal-index-heading">
              <div>
                <span>02 / THE TRAVELMINT JOURNAL</span>
                <h2>
                  A little knowledge. <em>A better journey.</em>
                </h2>
                <p>
                  Thoughtful guides and useful details for wherever you're headed.
                </p>
              </div>

              <div className="journal-index-controls">
                <button
                  type="button"
                  aria-label="Previous category"
                  onClick={() =>
                    setActiveJournalIndex(
                      (current) =>
                        (current - 1 + journalSections.length) % journalSections.length
                    )
                  }
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Next category"
                  onClick={() =>
                    setActiveJournalIndex(
                      (current) => (current + 1) % journalSections.length
                    )
                  }
                >
                  →
                </button>
              </div>
            </div>

            <div className="journal-index-track">
              {journalSections.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={activeJournalIndex === index ? "active" : ""}
                  aria-pressed={activeJournalIndex === index}
                  onClick={() => setActiveJournalIndex(index)}
                >
                  <span>0{index + 1}</span>
                  {item.title}
                </button>
              ))}
            </div>

            <div className="journal-reading" aria-live="polite" key={activeJournal.id}>
              <div className="journal-reading-lead">
                <div className="journal-reading-lead-top">
                  <span>0{activeJournalIndex + 1} / FIELD NOTES</span>
                  <span>{journalEditorialNotes[activeJournal.id].kicker}</span>
                </div>
                <h3>{activeJournal.title}</h3>
                <p className="journal-reading-description">{activeJournal.description}</p>
                <p className="journal-reading-intro">{journalEditorialNotes[activeJournal.id].intro}</p>
                <div className="journal-reading-meta">
                  <span>TRAVELMINT JOURNAL</span>
                  <span>4 IDEAS TO TAKE WITH YOU</span>
                </div>
              </div>

              <div className="journal-reading-stories">
                {activeJournal.content.map((item, index) => (
                  <article className="journal-story" key={item.title}>
                    <div className="journal-story-number">0{index + 1}</div>
                    <div className="journal-story-copy">
                      <span className="journal-story-label">
                        {activeJournal.topics[index] || "TRAVEL NOTE"}
                      </span>
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                      <span className="journal-story-rule" aria-hidden="true" />
                    </div>
                  </article>
                ))}
              </div>

              <blockquote className="journal-reading-quote">
                <span>AN IDEA TO REMEMBER</span>
                <p>“{journalEditorialNotes[activeJournal.id].quote}”</p>
              </blockquote>

              <div className="journal-reading-bottom">
                <p>{journalEditorialNotes[activeJournal.id].closing}</p>
                <div className="journal-reading-topics">
                  {activeJournal.topics.map((topic) => (
                    <span key={topic}>{topic}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </section>

        

        <footer className="dashboard-footer">
          <strong>TRAVELMINT®</strong>
          <span>Made for the places that stay with you.</span>
          <span>PLAN WITH PURPOSE.</span>
        </footer>
      </main>

      <NewTripModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={createTrip}
        title={title}
        setTitle={setTitle}
        budget={budget}
        setBudget={setBudget}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {selectedDestination && (
        <div
          className="destination-detail-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDestinationDetails();
            }
          }}
        >
          <section
            className="destination-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="destination-detail-title"
          >
            <button
              type="button"
              className="destination-detail-close"
              onClick={closeDestinationDetails}
              aria-label="Close destination details"
            >
              ×
            </button>

            <div className="destination-detail-hero">
              <img
                src={selectedDestination.image}
                alt={`${selectedDestination.name}, ${selectedDestination.country}`}
              />
              <div className="destination-detail-hero-shade" />
              <div className="destination-detail-hero-copy">
                <span>
                  {selectedDestination.country} / {selectedDestination.region}
                </span>
                <h2 id="destination-detail-title">
                  {selectedDestination.name}
                </h2>
                <p>{selectedDestination.bestFor}</p>
              </div>
            </div>

            <div className="destination-detail-body">
              <section className="destination-detail-overview">
                <span className="destination-detail-eyebrow">01 / OVERVIEW</span>
                <h3>A place to discover</h3>
                <p>{selectedDestination.description}</p>
              </section>

              <div className="destination-detail-columns">
                <section className="destination-detail-block">
                  <span className="destination-detail-eyebrow">02 / TOP ATTRACTIONS</span>
                  <h3>Places worth visiting</h3>
                  <ul>
                    {selectedDestination.highlights.map((place) => (
                      <li key={place}>{place}</li>
                    ))}
                  </ul>
                </section>

                <section className="destination-detail-block">
                  <span className="destination-detail-eyebrow">03 / BEST TIME TO VISIT</span>
                  <h3>When to go</h3>
                  <p>{selectedDestination.season}</p>
                </section>

                <section className="destination-detail-block">
                  <span className="destination-detail-eyebrow">04 / DAILY BUDGET</span>
                  <h3>Estimated daily spend</h3>
                  <p className="destination-detail-budget">
                    {formatCurrency(selectedDestination.dailyBudget)}
                    <small> per person / day</small>
                  </p>
                  <p className="destination-detail-note">
                    Indicative estimate. Actual costs vary by travel style, dates and bookings.
                  </p>
                </section>

                <section className="destination-detail-block">
                  <span className="destination-detail-eyebrow">05 / THINGS TO EXPERIENCE</span>
                  <h3>Make it memorable</h3>
                  <ul>
                    {destinationExperiences[selectedDestination.id].map((experience) => (
                      <li key={experience}>{experience}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="destination-detail-footer">
                <div>
                  <span className="destination-detail-eyebrow">YOUR NEXT CHAPTER</span>
                  <h3>Ready to make the journey?</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeDestinationDetails();
                    setOpenModal(true);
                  }}
                >
                  PLAN A TRIP ↗
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default Dashboard;
