import nominations from "../data/nominations.json";
import { useState, useEffect } from "react";

const Sidebar = ({ seen }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const categoryIds = nominations.map((cat) =>
        cat.category.replace(/\s+/g, "-").toLowerCase(),
      );

      for (let i = categoryIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(categoryIds[i]);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveCategory(categoryIds[i]);
          return;
        }
      }
      setActiveCategory(null);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="sidebar">
      <p
        style={{
          fontSize: "13px",
          color: "#9ca4ab",
          marginBottom: "1rem",
          fontWeight: "500",
        }}
      >
        Your progress
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {nominations.map((cat) => {
          const seenCount = cat.nominees.filter((n) =>
            seen.some((k) => k.startsWith(`${n.tmdb_id}-`)),
          ).length;
          const categoryId = cat.category.replace(/\s+/g, "-").toLowerCase();
          const total = cat.nominees.length;
          const isActive = activeCategory === categoryId;
          const percentage = (seenCount / total) * 100;
          const isComplete = seenCount === total;

          return (
            <div
              key={cat.category}
              onClick={() => {
                document
                  .getElementById(categoryId)
                  ?.scrollIntoView({ behavior: "smooth" });
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
                <span
                  style={{
                    fontSize: "13px",
                    color: isActive ? "#AB8BFF" : "white",
                  }}
                >
                  {cat.category}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "white",
                  }}
                >
                  {seenCount}/{total}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "white" }}
            >
              Total seen
            </span>
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "white" }}
            >
              {[...new Set(seen.map((k) => k.split("-")[0]))].length}/
              {
                [
                  ...new Set(
                    nominations.flatMap((cat) =>
                      cat.nominees.map((n) => n.tmdb_id),
                    ),
                  ),
                ].length
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
