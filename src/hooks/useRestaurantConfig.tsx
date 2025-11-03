import { useState, useEffect, useCallback } from "react";
import { useList, BaseRecord, useOne } from "@refinedev/core";
import { httpClient } from "../services/httpClient";

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
    payment_mode: 'always' | 'rules';
    min_guests_for_payment: number;
    deposit_amount_per_guest: number;
    currency: string;
    has_menu: boolean;
    auto_confirmation: boolean;
  };

  paymentCheckResult: {
    is_payment_enabled: boolean;
    amount: number;
  } | null;
  
  // API URL helpers for payment links
  getPaymentLink: (seqId: string | number) => string;
  checkPayment: (date: string, time: string, guests: number) => void;
  
  // Loading and error states
  isLoading: boolean;
  isCheckingPayment: boolean;
  isError: boolean;
  error: any;
  paymentCheckError: any;
}

interface PaymentCheckParams {
  date: string;
  time: string;
  number_of_guests: number;
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
    payment_mode: 'always' as 'always' | 'rules',
    min_guests_for_payment: 1,
    deposit_amount_per_guest: 0,
    currency: "MAD",
    has_menu: false,
    auto_confirmation: false,
  });
  const [paymentCheckResult, setPaymentCheckResult] = useState<{ is_payment_enabled: boolean; amount: number; } | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentCheckError, setPaymentCheckError] = useState<any>(null);
  
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

  // Fetch general widget settings
  const { 
    data: widgetData, 
    isLoading: isLoadingWidget, 
    error: widgetError 
  } = useOne({
    resource: `api/v1/bo/restaurants/${restaurantId}/widget`,
    id: "",
    queryOptions: {
      enabled: !!restaurantId,
      onSuccess: (data) => {
        if (data?.data) {
          const widgetInfo = data.data as BaseRecord;
          setWidgetConfig(prev => ({
            ...prev,
            currency: widgetInfo.currency || "MAD",
            has_menu: !!widgetInfo.has_menu,
            auto_confirmation: !!widgetInfo.auto_confirmation,
          }));
        }
      }
    }
  });

  // Fetch payment settings
  const {
    data: paymentSettingsData,
    isLoading: isLoadingPaymentSettings,
    error: paymentSettingsError,
  } = useOne({
    resource: "api/v1/bo/payments/settings",
    id: "1/", // Placeholder ID, as the endpoint is not resource-specific
    queryOptions: {
      enabled: !!restaurantId,
      onSuccess: (data) => {
        if (data?.data) {
          const settings = data.data as any;
          setWidgetConfig(prev => ({
            ...prev,
            enable_payment: settings.enable_paymant,
            payment_mode: settings.payment_mode,
            min_guests_for_payment: Number(settings.min_guests_for_payment || 1),
            deposit_amount_per_guest: Number(settings.deposit_amount_par_guest || 0),
          }));
        }
      },
    },
  });

  const checkPayment = useCallback(async (date: string, time: string, guests: number) => {
    setIsCheckingPayment(true);
    setPaymentCheckError(null);
    setPaymentCheckResult(null);
    try {
      const response = await httpClient.get('api/v1/bo/subdomains/public/customer/payment/check/', {
        params: {
          date,
          time,
          number_of_guests: guests,
        },
      });
      setPaymentCheckResult(response.data);
    } catch (error) {
      setPaymentCheckError(error);
    } finally {
      setIsCheckingPayment(false);
    }
  }, []);
  
  /**
   * Helper function to generate payment links
   */
  const getPaymentLink = (seqId: string | number): string => {
    const API_HOST = import.meta.env.VITE_API_URL || "https://api.dev.tabla.ma";
    const baseUrl = API_HOST.includes('dev') ? 
      `https://${subdomain}.dev.tabla.ma` : 
      `https://${subdomain}.tabla.ma`;
      
    return `${baseUrl}/payment/link/${seqId}`;
  };

  const combinedIsLoading = isLoadingSubdomain || isLoadingWidget || isLoadingPaymentSettings;
  const combinedError = subdomainError || widgetError || paymentSettingsError;

  return {
    restaurantId,
    subdomain,
    widgetConfig,
    getPaymentLink,
    checkPayment,
    paymentCheckResult,
    isLoading: combinedIsLoading,
    isCheckingPayment,
    isError: !!combinedError,
    error: combinedError,
    paymentCheckError,
  };
};