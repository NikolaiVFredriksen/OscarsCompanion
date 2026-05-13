import { useState, useEffect } from "react";
import nominations from "../data/nominations.json";

const StickyProgress = ({ seen }) => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.querySelector(".nominations");
      if (el) {
        const rect = el.getBoundingClientRect();
        setVisible(rect.top < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const seenCount = [...new Set(seen.map((k) => k.split("-")[0]))].filter(
    Boolean,
  ).length;
  const totalCount = [
    ...new Set(
      nominations.flatMap((cat) => cat.nominees.map((n) => n.tmdb_id)),
    ),
  ].length;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
          className="sm:hidden"
        />
      )}

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          top: open ? "60px" : "-80%",
          left: 0,
          right: 0,
          height: "80vh",
          background: "#0f0d23",
          borderBottom: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: "0 0 20px 20px",
          padding: "20px",
          overflowY: "auto",
          transition: "top 0.3s ease",
          zIndex: 50,
        }}
        className="sm:hidden"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <p style={{ fontSize: "13px", color: "#9ca4ab", fontWeight: "500" }}>
            Your progress
          </p>
          <button
            onClick={() => setOpen(false)}
            style={{
              color: "rgba(255,255,255,0.5)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {nominations.map((cat) => {
            const seenInCat = cat.nominees.filter((n) =>
              seen.some((k) => k.startsWith(`${n.tmdb_id}-`)),
            ).length;
            const total = cat.nominees.length;
            const percentage = (seenInCat / total) * 100;
            const isComplete = seenInCat === total;

            return (
              <div
                key={cat.category}
                onClick={() => {
                  document
                    .getElementById(
                      cat.category.replace(/\s+/g, "-").toLowerCase(),
                    )
                    ?.scrollIntoView({ behavior: "smooth" });
                  setOpen(false);
                }}
                style={{ cursor: "pointer" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "white" }}>
                    {cat.category}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "white",
                    }}
                  >
                    {seenInCat}/{total}
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: isComplete ? "#22c55e" : "#AB8BFF",
                      borderRadius: "2px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "0.5px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{ fontSize: "14px", fontWeight: "600", color: "white" }}
              >
                Total seen
              </span>
              <span
                style={{ fontSize: "14px", fontWeight: "600", color: "white" }}
              >
                {seenCount}/{totalCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky button */}
      {visible && (
        <div
          onClick={() => setOpen(!open)}
          style={{
            position: "fixed",
            top: "0",
            left: 0,
            right: 0,
            background: "rgba(10,6,24,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "2px solid rgba(255,255,255,0.05)",
            padding: "24px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 51,
            cursor: "pointer",
          }}
          className="sm:hidden"
        >
          <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)" }}>
            📊 Your progress
          </span>
          <span
            style={{ fontSize: "15px", fontWeight: "600", color: "#AB8BFF" }}
          >
            {seenCount}/{totalCount} seen ›
          </span>
        </div>
      )}
    </>
  );
};

export default StickyProgress;
