import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import './index.css';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './utils/serviceWorker';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);

// Register service worker for offline functionality
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  serviceWorker.register({
    onSuccess: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('MathGenie is now available offline!');
      }
    },
    onUpdate: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('New version available! Please refresh the page.');
      }
    },
  });
}

// Load web vitals reporting
if (process.env.NODE_ENV === 'production') {
  reportWebVitals();
}
