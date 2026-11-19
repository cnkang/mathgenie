import type { Settings } from "@/types";
import React from "react";
import SettingsManager from "./SettingsManager";
import SettingsPresets from "./SettingsPresets";
import "./SettingsSection.css";
import RangeInput from "./form/RangeInput";
import AdvancedSettings from "./settings/AdvancedSettings";
import GroupingSettings from "./settings/GroupingSettings";
import PdfSettings from "./settings/PdfSettings";
import ProblemCountSettings from "./settings/ProblemCountSettings";

// Do not edit manually.
const STR_OPERATIONS = "operations" as const;

const STR_FROM = "From" as const;
const STR_TO = "To" as const;

const OPERATION_OPTIONS = [
  { value: "+", labelKey: "operations.addition" },
  { value: "-", labelKey: "operations.subtraction" },
  { value: "*", labelKey: "operations.multiplication" },
  { value: "/", labelKey: "operations.division" },
] as const;

type OnChange = <K extends keyof Settings>(field: K, value: Settings[K]) => void;

type SettingsSectionProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  settings: Settings;
  onChange: OnChange;
  onApplyPreset: (settings: Settings) => void;
  paperSizeOptions: Record<string, string>;
};

const SettingsSection: React.FC<SettingsSectionProps> = ({
  t,
  settings,
  onChange,
  onApplyPreset,
  paperSizeOptions,
}) => {
  const MIN_LABEL = t("settings.from") || STR_FROM;
  const MAX_LABEL = t("settings.to") || STR_TO;
  const settingsTitle = t("settings.title");
  const sectionLabel = settingsTitle === "settings.title" ? "Settings" : settingsTitle;

  return (
    <section className="settings-section" aria-label={sectionLabel}>
      <div className="field">
        <span className="field-label" id="operations-label">
          {t("operations.title")}
        </span>
        <div
          id={STR_OPERATIONS}
          role="group"
          aria-labelledby="operations-label"
          className="operations-chips"
        >
          {OPERATION_OPTIONS.map((option) => {
            const checked = settings.operations.includes(option.value);
            return (
              <label key={option.value} className={`operation-chip${checked ? " checked" : ""}`}>
                <input
                  type="checkbox"
                  value={option.value}
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...settings.operations, option.value]
                      : settings.operations.filter((operation) => operation !== option.value);
                    onChange(STR_OPERATIONS, next);
                  }}
                />
                <span className="operation-chip-text">{t(option.labelKey)}</span>
              </label>
            );
          })}
        </div>
        <small className="field-help">{t("operations.help")}</small>
      </div>

      <GroupingSettings t={t} settings={settings} onChange={onChange} />
      <ProblemCountSettings t={t} settings={settings} onChange={onChange} />

      <RangeInput
        id="numRange"
        idFrom="numRangeFrom"
        idTo="numRangeTo"
        label={t("settings.numberRange")}
        value={settings.numRange}
        onChange={(next) => onChange("numRange", next)}
        ariaMinLabel={MIN_LABEL}
        ariaMaxLabel={MAX_LABEL}
        decreaseLabel={t("accessibility.decreaseValue")}
        increaseLabel={t("accessibility.increaseValue")}
      />

      <RangeInput
        id="result-range"
        label={t("settings.resultRange")}
        value={settings.resultRange}
        onChange={(next) => onChange("resultRange", next)}
        ariaMinLabel={MIN_LABEL}
        ariaMaxLabel={MAX_LABEL}
        decreaseLabel={t("accessibility.decreaseValue")}
        increaseLabel={t("accessibility.increaseValue")}
      />

      <RangeInput
        id="operands-range"
        label={t("settings.operandsRange")}
        value={settings.numOperandsRange}
        onChange={(next) => onChange("numOperandsRange", next)}
        ariaMinLabel={MIN_LABEL}
        ariaMaxLabel={MAX_LABEL}
        decreaseLabel={t("accessibility.decreaseValue")}
        increaseLabel={t("accessibility.increaseValue")}
      />

      <SettingsPresets onApplyPreset={onApplyPreset} currentSettings={settings} />
      <SettingsManager settings={settings} onImportSettings={onApplyPreset} />
      <PdfSettings settings={settings} onChange={onChange} paperSizeOptions={paperSizeOptions} />
      <AdvancedSettings settings={settings} onChange={onChange} />
    </section>
  );
};

export default SettingsSection;
