import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEnvironment } from '../../hooks/useEnvironment';

// Extend Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const GA_TRACKING_ID = 'G-2K3573ZN7G';//Stream ID : 11476571564
const DEV_GA_TRACKING_ID = 'G-E20RS4YZRM';//Stream ID : 11479756754

const GoogleAnalytics = () => {
  const location = useLocation();
  const { isDevelopment, isLoaded } = useEnvironment();

  useEffect(() => {
    if (!isLoaded) return;

    const trackingId = isDevelopment ? DEV_GA_TRACKING_ID : GA_TRACKING_ID;
    const scriptId = 'google-analytics-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    
    // Make gtag globally available
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', trackingId);

  }, [isLoaded, isDevelopment]);

  useEffect(() => {
    if (!isLoaded || !(window as any).gtag) return;
    
    const trackingId = isDevelopment ? DEV_GA_TRACKING_ID : GA_TRACKING_ID;
    (window as any).gtag('config', trackingId, {
      page_path: location.pathname + location.search,
    });
  }, [location, isLoaded, isDevelopment]);

  return null;
};

export default GoogleAnalytics;
