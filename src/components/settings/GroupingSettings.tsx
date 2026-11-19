import type { Settings } from "@/types";
import { calculateActualTotalProblems } from "@/utils/groupingUtils";
import React from "react";
import NumberStepper from "../form/NumberStepper";

type OnChange = <K extends keyof Settings>(field: K, value: Settings[K]) => void;

type GroupingSettingsProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  settings: Settings;
  onChange: OnChange;
};

const GroupingSettings: React.FC<GroupingSettingsProps> = ({ t, settings, onChange }) => {
  const actualTotalProblems = calculateActualTotalProblems(settings);

  return (
    <div
      className={`field grouping-toggle ${settings.enableGrouping ? "grouping-enabled" : "grouping-disabled"}`}
    >
      <div className="grouping-header">
        <label className="field-label grouping-label">
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={settings.enableGrouping}
              onChange={(e) => onChange("enableGrouping", e.target.checked)}
              aria-label={t("accessibility.enableGroupingLabel")}
              className="grouping-checkbox"
            />
            <span className="checkbox-indicator"></span>
          </div>
          <span className="grouping-text">
            {t("settings.enableGrouping")}
            <span className="grouping-status">
              {settings.enableGrouping
                ? t("settings.groupingEnabled") || "✓ Enabled"
                : t("settings.groupingDisabled") || "○ Disabled"}
            </span>
          </span>
        </label>
      </div>
      <small className="field-help grouping-help">{t("settings.groupingHelp")}</small>

      <div className={`grouping-content ${settings.enableGrouping ? "expanded" : "collapsed"}`}>
        {settings.enableGrouping ? (
          <div className="grouping-fields">
            <div className="field-group">
              <div className="field">
                <label htmlFor="problemsPerGroup" className="field-label">
                  {t("settings.problemsPerGroup")}
                </label>
                <NumberStepper
                  id="problemsPerGroup"
                  value={settings.problemsPerGroup}
                  onCommit={(next) => onChange("problemsPerGroup", next)}
                  ariaLabel={t("accessibility.problemsPerGroupInput")}
                  decreaseLabel={t("accessibility.decreaseValue")}
                  increaseLabel={t("accessibility.increaseValue")}
                  min={1}
                  max={1000}
                  inputClassName="grouping-input"
                />
              </div>

              <div className="field">
                <label htmlFor="totalGroups" className="field-label">
                  {t("settings.totalGroups")}
                </label>
                <NumberStepper
                  id="totalGroups"
                  value={settings.totalGroups}
                  onCommit={(next) => onChange("totalGroups", next)}
                  ariaLabel={t("accessibility.totalGroupsInput")}
                  decreaseLabel={t("accessibility.decreaseValue")}
                  increaseLabel={t("accessibility.increaseValue")}
                  min={1}
                  max={100}
                  inputClassName="grouping-input"
                />
              </div>
            </div>

            <div className="field total-calculation">
              <div className="calculation-display">
                <span className="calculation-label">
                  {t("settings.totalProblemsCalculated", {
                    total: actualTotalProblems,
                  })}
                </span>
                <span className="calculation-formula">
                  ({settings.problemsPerGroup} × {settings.totalGroups})
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GroupingSettings;
