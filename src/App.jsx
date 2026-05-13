import { useState, useEffect } from "react";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { loginWithGoogle, logout, getCurrentUser } from "./lib/supabase";
import Nominations from "./components/Nominations";
import nominations from "./data/nominations.json";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";

import Sidebar from "./components/Sidebar";
import {
  getSeen,
  addSeen,
  removeSeen,
  getWatchlist,
  addWatchlist,
  removeWatchlist,
} from "./lib/supabase";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [seen, setSeen] = useState(() =>
    JSON.parse(localStorage.getItem("seen") || "[]"),
  );
  const [watchlist, setWatchlist] = useState(() =>
    JSON.parse(localStorage.getItem("watchlist") || "[]"),
  );

  const toggleWatchlist = async (tmdbId) => {
    const hasAny = watchlist.some((k) => k.startsWith(`${tmdbId}-`));
    if (hasAny) {
      const updated = watchlist.filter((k) => !k.startsWith(`${tmdbId}-`));
      setWatchlist(updated);
      localStorage.setItem("watchlist", JSON.stringify(updated));
      if (user) await removeWatchlist(user.id, tmdbId);
    } else {
      const updated = [...watchlist, `${tmdbId}-`];
      setWatchlist(updated);
      localStorage.setItem("watchlist", JSON.stringify(updated));
      if (user) await addWatchlist(user.id, tmdbId);
    }
  };

  const toggleSeen = async (tmdbId) => {
    const hasAny = seen.some((k) => k.startsWith(`${tmdbId}-`));
    if (hasAny) {
      const updated = seen.filter((k) => !k.startsWith(`${tmdbId}-`));
      setSeen(updated);
      localStorage.setItem("seen", JSON.stringify(updated));
      if (user) await removeSeen(user.id, tmdbId);
    } else {
      const updated = [...seen, `${tmdbId}-`];
      setSeen(updated);
      localStorage.setItem("seen", JSON.stringify(updated));
      if (user) await addSeen(user.id, tmdbId);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const seenData = await getSeen(currentUser.id);
        const watchlistData = await getWatchlist(currentUser.id);
        setSeen(seenData.map((id) => `${id}-`));
        setWatchlist(watchlistData.map((id) => `${id}-`));
      }
    };
    fetchUser();
  }, []);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      const data = await response.json();

      if (data.response === "False") {
        setErrorMessage(data.Error || "No movies found");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results && data.results.length > 0) {
        try {
          // Update search count in Supabase with error handling
          await updateSearchCount(query, data.results[0]);
        } catch (supabaseError) {
          console.error("Error updating search count:", supabaseError);
          // Don't crash the app if Supabase fails, just log the error
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setErrorMessage("Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="pattern" />

      <header
        style={{
          background: "#0a0618",
          overflow: "hidden",
          marginBottom: "2rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px" }}
        >
          <nav
            style={{
              padding: "12px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "0.5px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src="/movie.svg"
                alt="OscarsCompanion logo"
                style={{
                  width: "24px",
                  height: "24px",
                  marginBottom: "7px",
                  marginLeft: "2px",
                  marginRight: "1px",
                }}
              />

              <span
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                }}
              >
                OscarsCompanion
              </span>
            </div>
            {user ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                {/* <span
                  style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}
                >
                  {user.name?.split(" ")[0]}
                </span> */}
                <button
                  onClick={async () => {
                    await logout();
                    setUser(null);
                    setSeen([]);
                    setWatchlist([]);
                    localStorage.removeItem("seen");
                    localStorage.removeItem("watchlist");
                  }}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                style={{
                  background: "white",
                  color: "black",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  style={{ width: "14px", height: "14px" }}
                />
                Sign in with Google
              </button>
            )}
          </nav>
        </div>

        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            position: "relative",
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(171,139,255,0.15) 0%, transparent 70%)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              letterSpacing: "0.15em",
              color: "#AB8BFF",
              margin: "0 0 12px",
              textTransform: "uppercase",
            }}
          >
            98th Academy Awards
          </p>
          <h4
            style={{
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: "700",
              color: "white",
              margin: "0 0 8px",
              lineHeight: "1.2",
              textAlign: "center",
              width: "100%",
            }}
          >
            Your companion for
            <br />
            the 2026 Oscars
          </h4>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              margin: "0",
            }}
          >
            Track every nomination. Never miss a winner.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "16px 24px",
              textAlign: "center",
              border: "0.5px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "white",
                margin: "0",
                lineHeight: "1",
              }}
            >
              {
                [...new Set(seen.map((k) => k.split("-")[0]))].filter(Boolean)
                  .length
              }
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                margin: "4px 0 0",
              }}
            >
              films seen
            </p>
          </div>

          <div
            style={{
              background: "rgba(171,139,255,0.1)",
              borderRadius: "12px",
              padding: "16px 24px",
              textAlign: "center",
              border: "0.5px solid rgba(171,139,255,0.2)",
            }}
          >
            <p
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#AB8BFF",
                margin: "0",
                lineHeight: "1",
              }}
            >
              {
                [...new Set(watchlist.map((k) => k.split("-")[0]))].filter(
                  Boolean,
                ).length
              }
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(171,139,255,0.6)",
                margin: "4px 0 0",
              }}
            >
              in watchlist
            </p>
          </div>
        </div>

        {/* {!user && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.4)",
                margin: "0 0 10px",
              }}
            >
              Sign in to save your progress across devices
            </p>
          </div>
        )} */}
      </header>

      <div className="wrapper">
        <div className="layout-grid">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "✕ Hide Progress" : "📊 Show Progress"}
          </button>
          <div className={`sidebar-wrapper ${sidebarOpen ? "open" : ""}`}>
            <Sidebar seen={seen} />
          </div>
          <div>
            <div
              style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}
            >
              {["All", "Seen", "Watchlist"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f.toLowerCase())}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: filter === f.toLowerCase() ? "600" : "400",
                    background:
                      filter === f.toLowerCase() ? "white" : "transparent",
                    color: filter === f.toLowerCase() ? "black" : "#9ca4ab",
                    border: "1px solid",
                    borderColor:
                      filter === f.toLowerCase() ? "white" : "#9ca4ab",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <Nominations
              seen={seen}
              toggleSeen={toggleSeen}
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
              filter={filter}
            />
          </div>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </main>
  );
};

export default App;
