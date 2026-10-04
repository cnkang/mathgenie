import type { Metric } from "web-vitals";
export type ReportHandler = (metric: Metric) => void;
const reportWebVitals = (handler?: ReportHandler): void => {
  if (!handler) return;
  void import("web-vitals")
    .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(handler);
      onFCP(handler);
      onINP(handler);
      onLCP(handler);
      onTTFB(handler);
    })
    .catch(() => {});
};
export default reportWebVitals;
