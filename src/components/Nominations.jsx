import { useState, useEffect } from "react";
import nominations from "../data/nominations.json";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const Nominations = ({
  seen,
  toggleSeen,
  filter,
  watchlist,
  toggleWatchlist,
}) => {
  const [movieData, setMovieData] = useState({});
  const [personData, setPersonData] = useState({});

  useEffect(() => {
    const fetchMovieData = async () => {
      const uniqueIds = [
        ...new Set(
          nominations.flatMap((cat) => cat.nominees.map((n) => n.tmdb_id)),
        ),
      ];
      const results = {};
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const res = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS);
            const data = await res.json();
            results[id] = data;
          } catch (e) {
            console.error(`Failed to fetch movie ${id}`, e);
          }
        }),
      );
      setMovieData(results);
      const personIds = [
        ...new Set(
          nominations.flatMap((cat) =>
            cat.nominees.filter((n) => n.person_id).map((n) => n.person_id),
          ),
        ),
      ];
      const personResults = {};
      await Promise.all(
        personIds.map(async (id) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/person/${id}`,
              API_OPTIONS,
            );
            const data = await res.json();
            personResults[id] = data;
          } catch (e) {
            console.error(`Failed to fetch person ${id}`, e);
          }
        }),
      );
      setPersonData(personResults);
    };
    fetchMovieData();
  }, []);

  const hasAnyResults = nominations.some((cat) => {
    const filtered = cat.nominees.filter((n) => {
      if (filter === "seen")
        return seen.some((k) => k.startsWith(`${n.tmdb_id}-`));
      if (filter === "watchlist")
        return watchlist.some((k) => k.startsWith(`${n.tmdb_id}-`));
      return true;
    });
    return filtered.length > 0;
  });

  if (!hasAnyResults) {
    return (
      <section className="nominations">
        <p style={{ color: "#9ca4ab", marginTop: "2rem" }}>
          {filter === "seen"
            ? "No movies marked as seen yet."
            : "No movies added to watchlist yet."}
        </p>
      </section>
    );
  }

  return (
    <section className="nominations">
      {nominations.map((cat, index) => {
        const filteredNominees = cat.nominees.filter((n) => {
          if (filter === "seen")
            return seen.some((k) => k.startsWith(`${n.tmdb_id}-`));
          if (filter === "watchlist")
            return watchlist.some((k) => k.startsWith(`${n.tmdb_id}-`));
          return true;
        });

        if (filteredNominees.length === 0) return null;

        return (
          <div
            key={cat.category}
            id={cat.category.replace(/\s+/g, "-").toLowerCase()}
          >
            <h2 className={`${index === 0 ? "mt-15" : "mt-20"} mb-2`}>
              {cat.category}
            </h2>
            <ul>
              {filteredNominees.map((nominee, index) => {
                const movie = movieData[nominee.tmdb_id];
                const rating = movie?.vote_average
                  ? movie.vote_average.toFixed(1)
                  : "N/A";
                const isSeen = seen.some((k) =>
                  k.startsWith(`${nominee.tmdb_id}-`),
                );
                const isWatchlisted = watchlist.some((k) =>
                  k.startsWith(`${nominee.tmdb_id}-`),
                );

                return (
                  <li key={index}>
                    <div className="movie-card">
                      <img
                        src={
                          nominee.person_id &&
                          personData[nominee.person_id]?.profile_path
                            ? `https://image.tmdb.org/t/p/w500/${personData[nominee.person_id].profile_path}`
                            : movie?.poster_path
                              ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                              : `/no-movie.png`
                        }
                        alt={nominee.person || nominee.title}
                      />
                      <div className="mt-4">
                        <h3>{nominee.title}</h3>
                        <div className="content">
                          {nominee.person ? (
                            <span
                              className="lang"
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "100%",
                              }}
                            >
                              {nominee.person}
                            </span>
                          ) : (
                            <span className="lang">
                              {movie?.genres?.[0]?.name || "N/A"}
                            </span>
                          )}

                          {/* {nominee.won === true && (
                            <span className="winner-badge"> • &nbsp;🏆</span>
                          )} */}
                        </div>
                        <div className="card-actions mb-5">
                          <button
                            onClick={() => toggleSeen(nominee.tmdb_id)}
                            className={isSeen ? "active" : ""}
                          >
                            👁{" "}
                            <span className="hidden sm:inline">
                              {isSeen ? "Seen" : "Unseen"}
                            </span>
                            <span className="sm:hidden">
                              {isSeen ? "Seen" : "Mark as seen"}
                            </span>
                          </button>
                          <button
                            onClick={() => toggleWatchlist(nominee.tmdb_id)}
                            className={isWatchlisted ? "active" : ""}
                          >
                            🔖 {isWatchlisted ? "Added" : "Watchlist"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
};

export default Nominations;
