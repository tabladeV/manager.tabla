// src/providers/swManager.ts
// The name of your service worker file as configured in vite.config.ts and output by VitePWA
// service worker file name used in prod is different from dev handle 
const PWA_SERVICE_WORKER_NAME = import.meta.env.MODE === 'development' ? '/dev-sw.js?dev-sw' : '/firebase-messaging-sw.js';
const SERVICE_WORKER_SCOPE = '/';

/**
 * Registers the PWA service worker if not already registered or if the existing one is different.
 * Ensures the service worker is registered with the correct scope.
 */
export async function registerPwaServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[SW Manager] Service Worker not supported in this environment.');
    return undefined;
  }

  try {
    // Check existing registrations to see if our specific SW is already there and active
    const existingRegistrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of existingRegistrations) {
      if (reg.active && reg.active.scriptURL.endsWith(PWA_SERVICE_WORKER_NAME) && reg.scope === (window.location.origin + SERVICE_WORKER_SCOPE)) {
        // Optionally trigger an update check on the existing active worker
        // reg.update(); 
        return reg;
      }
    }

    // If not found or not active with correct scope, attempt to register.
    const registration = await navigator.serviceWorker.register(PWA_SERVICE_WORKER_NAME, {
      scope: SERVICE_WORKER_SCOPE,
      // type: 'module', // VitePWA should handle if the SW output is a module
    });
    
    // Wait for the new service worker to become active
    // This is important before calling getToken with this registration
    if (registration.installing) {
      await new Promise<void>(resolve => {
        if (registration.installing) {
          registration.installing.addEventListener('statechange', () => {
            if (registration.active) {
              resolve();
            }
          });
        } else {
          // If installing becomes null before we can attach the event, resolve immediately
          resolve();
        }
      });
    } else if (!registration.active) {
        // If there's no installing worker, but it's not active yet,
        // it might be waiting. navigator.serviceWorker.ready can help.
        await navigator.serviceWorker.ready;
    }
    return registration;

  } catch (error) {
    console.error(`[SW Manager] Error during service worker ${PWA_SERVICE_WORKER_NAME} registration or activation:`, error);
    return undefined;
  }
}

/**
 * Gets the current service worker registration, preferring the one managed by PWA.
 * It prioritizes an active service worker matching the name and scope.
 */
export async function getSWRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[SW Manager] Service Worker not supported for getSWRegistration.');
    return undefined;
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      if (registration.active && 
          registration.active.scriptURL.endsWith(PWA_SERVICE_WORKER_NAME) &&
          registration.scope === (window.location.origin + SERVICE_WORKER_SCOPE)) {
        return registration;
      }
    }
    
    // Fallback if not immediately active, try to find a non-active one matching criteria
    // This might be less ideal for getToken which prefers an active worker.
    for (const registration of registrations) {
        const swScriptUrl = registration.installing?.scriptURL || registration.waiting?.scriptURL;
        if (swScriptUrl && swScriptUrl.endsWith(PWA_SERVICE_WORKER_NAME) && registration.scope === (window.location.origin + SERVICE_WORKER_SCOPE)) {
            return registration; // Firebase getToken might handle waiting for activation
        }
    }
    return undefined;
  } catch (err) {
    console.error('[SW Manager] Error in getSWRegistration:', err);
    return undefined;
  }
}

/**
 * Manages the service worker lifecycle: registers on login/permission, unregisters on logout/denial.
 */
export async function updateServiceWorker() {
  if (typeof navigator === 'undefined' || 
      typeof window === 'undefined' || 
      !('serviceWorker' in navigator) || 
      !('PushManager' in window)) {
    console.warn('[SW Manager] Push notifications or Service Worker not supported.');
    return;
  }

  const isLoggedIn = localStorage.getItem('isLogedIn') === 'true';
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
  let registration = await getSWRegistration(); // Check if our SW is already registered

  if (!isLoggedIn || permission === 'denied') {
    if (registration) {
      // Only unregister if it's our specific service worker
      if (registration.active?.scriptURL.endsWith(PWA_SERVICE_WORKER_NAME) ||
          registration.installing?.scriptURL.endsWith(PWA_SERVICE_WORKER_NAME) ||
          registration.waiting?.scriptURL.endsWith(PWA_SERVICE_WORKER_NAME)) {
        await registration.unregister();
      }
    }
    return;
  }

  // If logged in and permission is not denied, ensure our SW is registered.
  // At this point, permission is either 'granted' or 'default'
  if (!registration || !(registration.active?.scriptURL.endsWith(PWA_SERVICE_WORKER_NAME))) {
    registration = await registerPwaServiceWorker(); // This function now also waits for activation
    if (!registration) {
      console.error(`[SW Manager] Failed to register/activate ${PWA_SERVICE_WORKER_NAME} via updateServiceWorker.`);
    }
  }
}