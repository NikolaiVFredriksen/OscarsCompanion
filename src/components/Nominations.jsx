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
  const [selectedNominee, setSelectedNominee] = useState(null);

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
                    <div
                      className="movie-card"
                      onClick={() => setSelectedNominee(nominee)}
                      style={{ cursor: "pointer" }}
                    >
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSeen(nominee.tmdb_id);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(nominee.tmdb_id);
                            }}
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

      {selectedNominee && (
        <div
          onClick={() => setSelectedNominee(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0f0d23",
              borderRadius: "16px",
              maxWidth: "720px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "0.5px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                padding: "20px",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
              }}
            >
              <img
                src={
                  selectedNominee.person_id &&
                  personData[selectedNominee.person_id]?.profile_path
                    ? `https://image.tmdb.org/t/p/w500/${personData[selectedNominee.person_id].profile_path}`
                    : movieData[selectedNominee.tmdb_id]?.poster_path
                      ? `https://image.tmdb.org/t/p/w500/${movieData[selectedNominee.tmdb_id].poster_path}`
                      : `/no-movie.png`
                }
                alt={selectedNominee.title}
                style={{
                  width: "200px",
                  minWidth: "200px",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "300px",
                }}
              >
                {/* Topp-innhold */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <h3
                      style={{
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "700",
                        margin: 0,
                      }}
                    >
                      {selectedNominee.title}
                    </h3>
                    <button
                      onClick={() => setSelectedNominee(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                        fontSize: "18px",
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {selectedNominee.person && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#AB8BFF",
                        marginBottom: "8px",
                      }}
                    >
                      {selectedNominee.person}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginBottom: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    {movieData[selectedNominee.tmdb_id]?.genres
                      ?.slice(0, 2)
                      .map((g) => (
                        <span
                          key={g.id}
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "20px",
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.6)",
                          }}
                        >
                          {g.name}
                        </span>
                      ))}
                    {movieData[selectedNominee.tmdb_id]?.vote_average && (
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "20px",
                          background: "rgba(171,139,255,0.15)",
                          color: "#AB8BFF",
                        }}
                      >
                        ⭐{" "}
                        {movieData[
                          selectedNominee.tmdb_id
                        ].vote_average.toFixed(1)}
                      </span>
                    )}
                    {movieData[selectedNominee.tmdb_id]?.release_date && (
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "20px",
                          background: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {
                          movieData[selectedNominee.tmdb_id].release_date.split(
                            "-",
                          )[0]
                        }
                      </span>
                    )}
                  </div>

                  {movieData[selectedNominee.tmdb_id]?.overview && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: "1.6",
                      }}
                    >
                      {movieData[selectedNominee.tmdb_id].overview}
                    </p>
                  )}
                </div>

                {/* Knapper nederst */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      toggleSeen(selectedNominee.tmdb_id);
                      setSelectedNominee(null);
                    }}
                    className={
                      seen.some((k) =>
                        k.startsWith(`${selectedNominee.tmdb_id}-`),
                      )
                        ? "active"
                        : ""
                    }
                    style={{
                      flex: 1,
                      color: "white",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "8px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    👁{" "}
                    {seen.some((k) =>
                      k.startsWith(`${selectedNominee.tmdb_id}-`),
                    )
                      ? "Seen"
                      : "Mark as seen"}
                  </button>
                  <button
                    onClick={() => {
                      toggleWatchlist(selectedNominee.tmdb_id);
                      setSelectedNominee(null);
                    }}
                    className={
                      watchlist.some((k) =>
                        k.startsWith(`${selectedNominee.tmdb_id}-`),
                      )
                        ? "active"
                        : ""
                    }
                    style={{
                      flex: 1,
                      color: "white",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "8px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    🔖{" "}
                    {watchlist.some((k) =>
                      k.startsWith(`${selectedNominee.tmdb_id}-`),
                    )
                      ? "Added"
                      : "Watchlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Nominations;
