import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Extend Window interface to include dataLayer and GTM
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// GTM configuration mapping from the TSV file
const GTM_CONFIG: Record<string, string> = {
  'buddhabar.tabla.ma': 'GTM-WCDRMFG7',
  'chaylounge.tabla.ma': 'GTM-P9XDH3L5',
  'lecedar.tabla.ma': 'GTM-PBZPVTSD',
  'ledielli.tabla.ma': 'GTM-WC3FCX3F',
  'lesenya.tabla.ma': 'GTM-P8TZTLBL',
  'lev.tabla.ma': 'GTM-598DNG6C',
  'mimakitchen.tabla.ma': 'GTM-5WKWMG7K'
};

const GoogleTagManager = () => {
  const location = useLocation();
  const currentHostname = window.location.hostname;
  
  // Get GTM ID for current subdomain
  const gtmId = GTM_CONFIG[currentHostname];
  const isAllowedDomain = !!gtmId;

  // Initialize GTM on component mount
  useEffect(() => {
    if (!isAllowedDomain) {
      console.log('GTM not loaded - domain not in allowed list:', currentHostname);
      return;
    }

    const scriptId = 'google-tag-manager-script';
    if (document.getElementById(scriptId)) {
      console.log('GTM already initialized');
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // GTM initialization function
    (function(w: Window, d: Document, s: string, l: string, i: string) {
      w[l] = w[l] || [];
      w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
      
      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s) as HTMLScriptElement;
      const dl = l !== 'dataLayer' ? '&l=' + l : '';
      
      j.async = true;
      j.id = scriptId;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      
      f.parentNode!.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', gtmId);

    console.log('GTM initialized with ID:', gtmId);

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

  }, [isAllowedDomain, gtmId, currentHostname]);

  // Push page view events on route changes
  useEffect(() => {
    if (!isAllowedDomain || !window.dataLayer) return;

    window.dataLayer.push({
      event: 'page_view',
      page_path: location.pathname + location.search,
      page_location: window.location.href
    });

    console.log('GTM - Page view tracked:', location.pathname + location.search);
  }, [location, isAllowedDomain]);

  return null;
};

export default GoogleTagManager;