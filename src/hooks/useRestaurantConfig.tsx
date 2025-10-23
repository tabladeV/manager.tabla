import { useState, useEffect } from "react";
import { useList, BaseRecord } from "@refinedev/core";

/**
 * Restaurant configuration interface
 */
export interface RestaurantConfig {
  // Restaurant identification
  restaurantId: string | null;
  subdomain: string;
  
  // Widget and payment configuration
  widgetConfig: {
    enable_payment: boolean;
    min_guests_for_payment: number;
    deposit_amount_per_guest: number;
    currency: string;
    has_menu: boolean;
    auto_confirmation: boolean;
  };
  
  // API URL helpers for payment links
  getPaymentLink: (seqId: string) => string;
  
  // Loading and error states
  isLoading: boolean;
  isError: boolean;
  error: any;
}

/**
 * Custom hook that fetches restaurant configuration including payment settings and subdomain
 * @returns RestaurantConfig object containing restaurant settings
 */
export const useRestaurantConfig = (): RestaurantConfig => {
  // Get restaurant ID from localStorage
  const restaurantId = localStorage.getItem('restaurant_id');
  
  // Initialize states
  const [subdomain, setSubdomain] = useState<string>("");
  const [widgetConfig, setWidgetConfig] = useState({
    enable_payment: false,
    min_guests_for_payment: 1,
    deposit_amount_per_guest: 0,
    currency: "MAD",
    has_menu: false,
    auto_confirmation: false,
  });
  
  // Fetch restaurant subdomain
  const { 
    data: subdomainData, 
    isLoading: isLoadingSubdomain, 
    error: subdomainError 
  } = useList({
    resource: 'api/v1/bo/restaurants/subdomain',
    queryOptions: {
      onSuccess: (data) => {
        if (data?.data) {
          const subdomainInfo = data.data as any as { subdomain: string };
          setSubdomain(subdomainInfo.subdomain);
        }
      }
    }
  });

  // Fetch widget settings which includes payment configuration
  const { 
    data: widgetData, 
    isLoading: isLoadingWidget, 
    error: widgetError 
  } = useList({
    resource: `api/v1/bo/restaurants/${restaurantId}/widget/`,
    queryOptions: {
      onSuccess: (data) => {
        if (data?.data) {
          const widgetInfo = data.data as BaseRecord;
          
          setWidgetConfig({
            enable_payment: !!widgetInfo.enable_paymant,
            min_guests_for_payment: Number(widgetInfo.min_number_of_guests_required_deposite || 1),
            deposit_amount_per_guest: Number(widgetInfo.deposite_amount_for_guest || 0),
            currency: widgetInfo.currency || "MAD",
            has_menu: !!widgetInfo.has_menu,
            auto_confirmation: !!widgetInfo.auto_confirmation,
          });
        }
      }
    }
  });
  
  /**
   * Helper function to generate payment links
   */
  const getPaymentLink = (seqId: string): string => {
    const API_HOST = import.meta.env.VITE_API_URL || "https://api.dev.tabla.ma";
    const baseUrl = API_HOST.includes('dev') ? 
      `https://${subdomain}.dev.tabla.ma` : 
      `https://${subdomain}.tabla.ma`;
      
    return `${baseUrl}/payment/link/${seqId}`;
  };

  return {
    restaurantId,
    subdomain,
    widgetConfig,
    getPaymentLink,
    isLoading: isLoadingSubdomain || isLoadingWidget,
    isError: !!subdomainError || !!widgetError,
    error: subdomainError || widgetError
  };
};