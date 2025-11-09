import React from 'react'
import GoogleAnalytics from '../components/common/GoogleAnalytics'
import GoogleTagManager from '../components/common/GoogleTagManager';
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Extend Window interface to include fbq
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const FB_PIXEL_ID = '1787481045231356';

// List of subdomains where Facebook Pixel should be installed
const ALLOWED_SUBDOMAINS = [
  'buddhabar.tabla.ma',
  'chaylounge.tabla.ma',
  'lecedar.tabla.ma',
  'ledielli.tabla.ma',
  'lesenya.tabla.ma',
  'lev.tabla.ma',
  'mimakitchen.tabla.ma'
];

const FacebookPixel = () => {
  const location = useLocation();

  // Check if current hostname is in the allowed list
  const isAllowedDomain = ALLOWED_SUBDOMAINS.includes(window.location.hostname);

  useEffect(() => {
    if (!isAllowedDomain) {
      console.log('Facebook Pixel not loaded - domain not in allowed list:', window.location.hostname);
      return;
    }

    const scriptId = 'facebook-pixel-script';
    if (document.getElementById(scriptId)) return;

    // Initialize Facebook Pixel
    (function(f: any, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: HTMLScriptElement) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.id = scriptId;
      t.src = v;
      s = b.getElementsByTagName(e)[0] as HTMLScriptElement;
      s.parentNode!.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', FB_PIXEL_ID);
    window.fbq('track', 'PageView');

    console.log('Facebook Pixel initialized with ID:', FB_PIXEL_ID);

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);

  }, [isAllowedDomain]);

  // Track page views on route changes
  useEffect(() => {
    if (!isAllowedDomain || !window.fbq) return;

    window.fbq('track', 'PageView');
    console.log('Facebook Pixel - Page view tracked:', location.pathname + location.search);
  }, [location, isAllowedDomain]);

  return null;
};

const Plugins = () => {
  return (
    <div>
      <FacebookPixel />
      <GoogleAnalytics />
      <GoogleTagManager />
      <Outlet />
    </div>
  )
}

export default Plugins
