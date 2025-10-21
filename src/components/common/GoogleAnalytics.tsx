import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEnvironment } from '../../hooks/useEnvironment';

// Extend Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
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

    // 1. Initialize dataLayer array
    window.dataLayer = window.dataLayer || [];
    
    // 2. Define the gtag function
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    
    // 3. Add the external GA script
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // 4. Configure GA
    gtag('js', new Date());
    gtag('config', trackingId);
    
    console.log('Google Analytics initialized with ID:', trackingId);

  }, [isLoaded, isDevelopment]);

  useEffect(() => {
    if (!isLoaded || !window.gtag) return;
    
    const trackingId = isDevelopment ? DEV_GA_TRACKING_ID : GA_TRACKING_ID;
    window.gtag('config', trackingId, {
      page_path: location.pathname + location.search,
    });
    console.log('Page view tracked:', location.pathname + location.search);
  }, [location, isLoaded, isDevelopment]);

  return null;
};

export default GoogleAnalytics;