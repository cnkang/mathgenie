// Service Worker registration utility with TypeScript support
// Handles PWA functionality and offline support

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

// SONAR-SAFE: The .exec() below is a regex method call, not OS command execution
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/.exec(window.location.hostname)
);

const isServiceWorkerSupported = (): boolean => 'serviceWorker' in navigator;

const isValidPublicUrl = (): boolean => {
  const publicUrl = new URL(import.meta.env.VITE_PUBLIC_URL || '', window.location.href);
  return publicUrl.origin === window.location.origin;
};

const handleServiceWorkerLoad = (config?: ServiceWorkerConfig): void => {
  const swUrl = `${import.meta.env.VITE_PUBLIC_URL || ''}/sw.js`;

  if (isLocalhost) {
    checkValidServiceWorker(swUrl, config);
    navigator.serviceWorker.ready.then(() => {
      console.log('This web app is being served cache-first by a service worker.');
    });
  } else {
    registerValidSW(swUrl, config);
  }
};

export function register(config?: ServiceWorkerConfig): void {
  if (!isServiceWorkerSupported()) {
    return;
  }

  if (!isValidPublicUrl()) {
    return;
  }

  window.addEventListener('load', () => handleServiceWorkerLoad(config));
}

const handleInstallingWorkerStateChange = (
  installingWorker: ServiceWorker,
  registration: ServiceWorkerRegistration,
  config?: ServiceWorkerConfig
): void => {
  if (installingWorker.state === 'installed') {
    if (navigator.serviceWorker.controller) {
      console.log('New content is available and will be used when all tabs are closed.');
      config?.onUpdate?.(registration);
    } else {
      console.log('Content is cached for offline use.');
      config?.onSuccess?.(registration);
    }
  }
};

const setupUpdateHandler = (
  registration: ServiceWorkerRegistration,
  config?: ServiceWorkerConfig
): void => {
  registration.onupdatefound = (): void => {
    const installingWorker = registration.installing;
    if (installingWorker === null) {
      return;
    }
    installingWorker.onstatechange = (): void => {
      handleInstallingWorkerStateChange(installingWorker, registration, config);
    };
  };
};

function registerValidSW(swUrl: string, config?: ServiceWorkerConfig): void {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      setupUpdateHandler(registration, config);
    })
    .catch((error: Error) => {
      console.error('Error during service worker registration:', error.message);
    });
}

const validateServiceWorkerUrl = (swUrl: string): boolean => {
  try {
    const url = new URL(swUrl, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    console.error('Invalid service worker URL');
    return false;
  }
};

const handleInvalidServiceWorker = (): void => {
  navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
    registration.unregister().then((): void => {
      window.location.reload();
    });
  });
};

const processServiceWorkerResponse = (
  response: Response,
  swUrl: string,
  config?: ServiceWorkerConfig
): void => {
  const contentType = response.headers.get('content-type');
  const isNotFound = response.status === 404;
  const isNotJavaScript = contentType !== null && !contentType.includes('javascript');

  if (isNotFound || isNotJavaScript) {
    handleInvalidServiceWorker();
  } else {
    registerValidSW(swUrl, config);
  }
};

function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig): void {
  if (!validateServiceWorkerUrl(swUrl)) {
    console.error('Service worker URL must be same-origin');
    return;
  }

  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response: Response) => {
      processServiceWorkerResponse(response, swUrl, config);
    })
    .catch((): void => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  navigator.serviceWorker.ready
    .then(registration => {
      registration.unregister();
    })
    .catch(error => {
      console.error(error.message);
    });
}
