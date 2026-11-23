import React from "react";
import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";
import "./AppHeader.css";

type AppHeaderProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  showPracticeIntro?: boolean;
};

const AppHeader: React.FC<AppHeaderProps> = ({ t, showPracticeIntro = true }) => {
  return (
    <header className="app-header" role="banner">
      <div className="app-header-bar">
        <div className="app-header-inner">
          <div className="app-brand">
            <span className="app-brand-mark" aria-hidden="true">
              ✦
            </span>
            <h1 className="app-title">{t("app.title")}</h1>
          </div>
          <div className="header-controls">
            <ThemeSelector />
            <LanguageSelector />
          </div>
        </div>
      </div>
      {showPracticeIntro && (
        <div className="practice-hero">
          <div className="practice-hero-copy">
            <h2 className="practice-hero-title">{t("app.practiceTitle")}</h2>
            <p className="app-subtitle">{t("app.subtitle")}</p>
          </div>
          <div className="practice-hero-art" aria-hidden="true">
            <span className="practice-hero-orbit" />
            <span className="practice-hero-orbit" />
            <span className="practice-hero-tile practice-hero-tile-add">+</span>
            <span className="practice-hero-tile practice-hero-tile-multiply">×</span>
            <span className="practice-hero-tile practice-hero-tile-divide">÷</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
