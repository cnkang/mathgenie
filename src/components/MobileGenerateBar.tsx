import React, { useEffect, useState } from "react";

type MobileGenerateBarProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  isGenerating: boolean;
  onGenerate: () => void;
};

/**
 * Sticky bottom generate bar for small screens.
 * The settings-first mobile layout puts the primary action ~2.5 screens
 * down; this bar keeps generation reachable from anywhere on the page.
 * Rendered only when the viewport matches (see useMediaQuery in App), and
 * hidden while the full generate card is on screen so the two never compete.
 */
const MobileGenerateBar: React.FC<MobileGenerateBarProps> = ({ t, isGenerating, onGenerate }) => {
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    // The generate card is rendered in the same non-quiz tree as this bar
    // (never lazy), so it exists by the time effects run.
    const card = document.querySelector(".generate-card");
    if (!card || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setCardVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  if (cardVisible) {
    return null;
  }

  return (
    <div className="mobile-generate-bar">
      <button
        type="button"
        className="mobile-generate-btn"
        onClick={onGenerate}
        disabled={isGenerating}
        aria-busy={isGenerating}
        aria-label={`${t(isGenerating ? "buttons.generating" : "buttons.generate")} · ${t("accessibility.generateButton")}`}
      >
        {t(isGenerating ? "buttons.generating" : "buttons.generate")}
      </button>
    </div>
  );
};

export default MobileGenerateBar;
