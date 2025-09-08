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

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals')
      .then(webVitals => {
        const vitals = webVitals as unknown as WebVitalsModule;
        if (vitals.getCLS) {
          vitals.getCLS(onPerfEntry);
        }
        if (vitals.getFID) {
          vitals.getFID(onPerfEntry);
        }
        if (vitals.getFCP) {
          vitals.getFCP(onPerfEntry);
        }
        if (vitals.getLCP) {
          vitals.getLCP(onPerfEntry);
        }
        if (vitals.getTTFB) {
          vitals.getTTFB(onPerfEntry);
        }
      })
      .catch(() => {
        // Silently fail if web-vitals is not available
      });
  }
};

export default reportWebVitals;
