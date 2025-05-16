// src/providers/swManager.ts
export async function updateServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[SW] Not supported in this browser');
    return;
  }

  const isLoggedIn = localStorage.getItem('isLogedIn') === 'true';
  const permission = Notification.permission; // 'default' | 'denied' | 'granted'
  const existingReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    console.log('[SW] Permission:', isLoggedIn, permission, existingReg);
  // 1) if no login → unregister & bail
  if (!isLoggedIn) {
    if (existingReg) {
      await existingReg.unregister();
      console.log('[SW] Unregistered because user logged out');
    }
    return;
  }

  // 2) if permission is denied → unregister & bail
  if (permission === 'denied') {
    if (existingReg) {
      await existingReg.unregister();
      console.log('[SW] Unregistered because notifications are denied');
    }
    return;
  }

  // 3) if granted & no existing registration → register
  if (permission === 'granted' && !existingReg) {
    try {
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('[SW] Registered:', reg.scope);
    } catch (err) {
      console.error('[SW] Registration failed:', err);
    }
    return;
  }

  // 4) else (either default permission or already registered) → do nothing
  console.log('[SW] No action needed:', { isLoggedIn, permission, hasReg: !!existingReg });
}
