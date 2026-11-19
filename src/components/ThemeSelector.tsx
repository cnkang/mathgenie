import React from "react";
import { useTheme, type ThemePreference } from "@/hooks/useTheme";
import { useTranslation } from "@/i18n";
import "./ThemeSelector.css";

const SunIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path
      d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SystemIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 20h8m-4-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const OPTIONS: { value: ThemePreference; labelKey: string; Icon: React.FC }[] = [
  { value: "light", labelKey: "theme.light", Icon: SunIcon },
  { value: "dark", labelKey: "theme.dark", Icon: MoonIcon },
  { value: "system", labelKey: "theme.system", Icon: SystemIcon },
];

const ThemeSelector: React.FC = () => {
  const { t } = useTranslation();
  const { preference, setPreference } = useTheme();

  return (
    <fieldset className="theme-selector" aria-label={t("theme.label")}>
      {OPTIONS.map(({ value, labelKey, Icon }) => (
        <button
          key={value}
          type="button"
          className={`theme-option${preference === value ? " active" : ""}`}
          aria-pressed={preference === value}
          aria-label={t(labelKey)}
          title={t(labelKey)}
          onClick={() => setPreference(value)}
        >
          <Icon />
        </button>
      ))}
    </fieldset>
  );
};

export default ThemeSelector;
