type ReportHandler = (metric: any) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals")
      .then((webVitals: any) => {
        if (webVitals.getCLS) {
          webVitals.getCLS(onPerfEntry);
        }
        if (webVitals.getFID) {
          webVitals.getFID(onPerfEntry);
        }
        if (webVitals.getFCP) {
          webVitals.getFCP(onPerfEntry);
        }
        if (webVitals.getLCP) {
          webVitals.getLCP(onPerfEntry);
        }
        if (webVitals.getTTFB) {
          webVitals.getTTFB(onPerfEntry);
        }
      })
      .catch(() => {
        // Silently fail if web-vitals is not available
      });
  }
};

export default reportWebVitals;
