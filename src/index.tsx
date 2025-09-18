import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import './index.css';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './utils/serviceWorker';
import { applyBrowserSpecificStyles, createPerformanceMonitor } from './utils/browserOptimizations';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Apply browser-specific optimizations
applyBrowserSpecificStyles();
const performanceMonitor = createPerformanceMonitor();
performanceMonitor.logBrowserInfo();

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);

const devLog = (...args: unknown[]): void => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

// Register service worker for offline functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  serviceWorker.register({
    onSuccess: () => devLog('MathGenie is now available offline!'),
    onUpdate: () => devLog('New version available! Please refresh the page.'),
  });
}

// Load web vitals reporting
if (import.meta.env.PROD) {
  reportWebVitals();
}
