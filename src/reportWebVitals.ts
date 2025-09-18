interface Metric {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

type ReportHandler = (metric: Metric) => void;

interface WebVitalsModule {
  getCLS?: (onReport: ReportHandler) => void;
  getFID?: (onReport: ReportHandler) => void;
  getFCP?: (onReport: ReportHandler) => void;
  getLCP?: (onReport: ReportHandler) => void;
  getTTFB?: (onReport: ReportHandler) => void;
  [key: string]: unknown;
}

const isValidReportHandler = (onPerfEntry?: ReportHandler): onPerfEntry is ReportHandler => {
  return onPerfEntry != null && onPerfEntry instanceof Function;
};

const setupWebVitalsReporting = (vitals: WebVitalsModule, onPerfEntry: ReportHandler): void => {
  if (vitals.getCLS) vitals.getCLS(onPerfEntry);
  if (vitals.getFID) vitals.getFID(onPerfEntry);
  if (vitals.getFCP) vitals.getFCP(onPerfEntry);
  if (vitals.getLCP) vitals.getLCP(onPerfEntry);
  if (vitals.getTTFB) vitals.getTTFB(onPerfEntry);
};

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (!isValidReportHandler(onPerfEntry)) {
    return;
  }

  import('web-vitals')
    .then(webVitals => {
      const vitals = webVitals as unknown as WebVitalsModule;
      setupWebVitalsReporting(vitals, onPerfEntry);
    })
    .catch(() => {
      // Silently fail if web-vitals is not available
    });
};

export default reportWebVitals;
