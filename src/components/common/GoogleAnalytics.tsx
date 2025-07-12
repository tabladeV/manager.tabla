import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Extend Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const GA_TRACKING_ID = 'G-2K3573ZN7G';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const scriptId = 'google-analytics-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    
    // Make gtag globally available
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID);

  }, []);

  useEffect(() => {
    if ((window as any).gtag) {
      (window as any).gtag('config', GA_TRACKING_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;