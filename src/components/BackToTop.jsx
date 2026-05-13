import { useEffect, useState } from "react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 1500) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        background: "rgba(171,139,255,0.15)",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(171,139,255,0.3)",
        color: "white",
        padding: "10px 14px",
        borderRadius: "999px",
        cursor: "pointer",
        fontSize: "14px",
        zIndex: 50,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(171,139,255,0.25)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "rgba(171,139,255,0.15)")
      }
    >
      ↑ Top
    </button>
  );
};

export default BackToTop;
