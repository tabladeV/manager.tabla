import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import axiosInstance from '../providers/axiosInstance';

/**
 * HTTP Response interface that standardizes responses across platforms
 */
export interface UnifiedHttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * HTTP Request configuration
 */
export interface HttpRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  responseType?: 'json' | 'blob' | 'text';
}

/**
 * Platform detection utilities
 */
export class PlatformDetector {
  static isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  static isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  static isWeb(): boolean {
    return Capacitor.getPlatform() === 'web';
  }

  static shouldUseCapacitorHttp(): boolean {
    // Use CapacitorHttp for iOS to bypass CORS issues
    // Can be extended for Android if needed
    return this.isIOS();
  }
}

/**
 * Unified HTTP Client that automatically chooses the best implementation
 * based on the current platform
 */
export class UnifiedHttpClient {
  private static readonly API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.dev.tabla.ma";

  /**
   * Makes an HTTP request using the appropriate client for the platform
   */
  static async request<T = any>(config: HttpRequestConfig): Promise<UnifiedHttpResponse<T>> {
    const useCapacitorHttp = PlatformDetector.shouldUseCapacitorHttp();
    
    
    if (useCapacitorHttp) {
      return this.makeCapacitorRequest<T>(config);
    } else {
      return this.makeAxiosRequest<T>(config);
    }
  }

  /**
   * GET request
   */
  static async get<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<UnifiedHttpResponse<T>> {
    let fullUrl = url;
    
    // Handle params for GET requests
    if (config?.params) {
      const queryString = new URLSearchParams(config.params).toString();
      fullUrl = queryString ? `${url}?${queryString}` : url;
    }
    
    return this.request<T>({
      url: fullUrl,
      method: 'GET',
      ...config
    });
  }

  /**
   * POST request
   */
  static async post<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<UnifiedHttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config
    });
  }

  /**
   * PUT request
   */
  static async put<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<UnifiedHttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    });
  }

  /**
   * PATCH request
   */
  static async patch<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<UnifiedHttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config
    });
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<UnifiedHttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...config
    });
  }

  /**
   * Makes request using CapacitorHttp (for native platforms)
   */
  private static async makeCapacitorRequest<T>(config: HttpRequestConfig): Promise<UnifiedHttpResponse<T>> {
    // Ensure proper URL construction with leading slash
    let fullUrl: string;
    if (config.url.startsWith('http')) {
      fullUrl = config.url;
    } else {
      const normalizedPath = config.url.startsWith('/') ? config.url : `/${config.url}`;
      fullUrl = `${this.API_BASE_URL}${normalizedPath}`;
    }
    
    const isFormData = config.data instanceof FormData;
    const headers = this.buildHeaders(config.headers, isFormData);
    
    const requestConfig: any = {
      url: fullUrl,
      method: config.method,
      headers,
      data: config.data
    };
    
    // Handle responseType for CapacitorHttp (basic support)
    if (config.responseType) {
      requestConfig.responseType = config.responseType;
    }
    
    
    try {
      const response: HttpResponse = await CapacitorHttp.request(requestConfig);
      
      // Handle authentication errors for CapacitorHttp too
      if (response.status === 401 || response.status === 403 || response.status === 411) {
        this.handleAuthenticationError({ response });
      }
      
      return {
        data: response.data,
        status: response.status,
        statusText: this.getStatusText(response.status),
        headers: response.headers || {}
      };
    } catch (error) {
      console.error('[HttpClient] CapacitorHttp error:', error);
      this.handleAuthenticationError(error);
      throw this.normalizeError(error);
    }
  }

  /**
   * Makes request using Axios (for web platforms)
   */
  private static async makeAxiosRequest<T>(config: HttpRequestConfig): Promise<UnifiedHttpResponse<T>> {
    const isFormData = config.data instanceof FormData;
    
    try {
      let response;
      
      const axiosConfig: any = { params: config.params };
      if (config.responseType) {
        axiosConfig.responseType = config.responseType;
      }

      // Add custom headers if provided
      if (config.headers) {
        axiosConfig.headers = config.headers;
      }

      switch (config.method) {
        case 'GET':
          response = await axiosInstance.get(config.url, axiosConfig);
          break;
        case 'POST':
          response = await axiosInstance.post(config.url, config.data, axiosConfig);
          break;
        case 'PUT':
          response = await axiosInstance.put(config.url, config.data, axiosConfig);
          break;
        case 'PATCH':
          response = await axiosInstance.patch(config.url, config.data, axiosConfig);
          break;
        case 'DELETE':
          response = await axiosInstance.delete(config.url, axiosConfig);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${config.method}`);
      }
      
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: this.normalizeHeaders(response.headers || {})
      };
    } catch (error) {
      console.error('[HttpClient] Axios error:', error);
      // Preserve axios error structure for backward compatibility
      this.handleAuthenticationError(error);
      throw error; // Axios errors are already well-formatted
    }
  }

  /**
   * Builds headers with common defaults and platform-specific requirements
   */
  private static buildHeaders(customHeaders?: Record<string, string>, isFormData?: boolean): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Required for Django CORS
      ...customHeaders
    };

    // Don't set Content-Type for FormData - let the browser/platform set it with boundary
    if (!isFormData && !customHeaders?.['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Add restaurant ID header if available (convert to number for Django compatibility)
    const restaurantId = localStorage.getItem("restaurant_id");
    if (restaurantId) {
      headers["X-Restaurant-ID"] = restaurantId;
    }

    // Add CSRF token for Django if available
    const csrfToken = this.getCSRFToken();
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    return headers;
  }

  /**
   * Gets CSRF token from localStorage or cookies
   */
  private static getCSRFToken(): string | null {
    // Try localStorage first
    const localToken = localStorage.getItem("csrftoken");
    if (localToken) return localToken;

    // Fall back to cookies
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] || null;
  }

  /**
   * Converts HTTP status code to status text
   */
  private static getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error'
    };
    
    return statusTexts[status] || 'Unknown';
  }

  /**
   * Normalizes headers to Record<string, string> format
   */
  private static normalizeHeaders(headers: any): Record<string, string> {
    const normalized: Record<string, string> = {};
    
    if (headers && typeof headers === 'object') {
      Object.keys(headers).forEach(key => {
        const value = headers[key];
        if (value !== undefined && value !== null) {
          normalized[key] = String(value);
        }
      });
    }
    
    return normalized;
  }

  /**
   * Handles authentication errors (401, 403, 411) by clearing auth data and redirecting
   */
  private static handleAuthenticationError(error: any): void {
    const status = error.response?.status;
    
    // Handle authentication errors like axiosInstance interceptor
    if (status === 401 || status === 411 || status === 403) {
      localStorage.removeItem("isLogedIn");
      localStorage.removeItem("restaurant_id");
      localStorage.removeItem("refresh");
      localStorage.removeItem("permissions");
      localStorage.removeItem("is_manager");

      window.location.href = "/sign-in";
    }
  }

  /**
   * Normalizes errors from different HTTP clients
   */
  private static normalizeError(error: any): Error {
    if (error.response) {
      // HTTP error response
      const httpError = new Error(`HTTP ${error.response.status}: ${error.response.statusText || 'Request failed'}`);
      (httpError as any).response = error.response;
      (httpError as any).status = error.response.status;
      return httpError;
    } else if (error.message) {
      // Network or other error
      return new Error(`Network Error: ${error.message}`);
    } else {
      // Unknown error
      return new Error('An unknown error occurred');
    }
  }
}

/**
 * Utility to check if an error is an HTTP error (replaces axios.isAxiosError)
 */
export const isHttpError = (error: any): boolean => {
  return error && (error.response || error.status || error.message);
};

/**
 * Utility to extract error message from HTTP error (handles both axios and unified client errors)
 */
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data) {
    // Django/API error format
    const data = error.response.data;
    if (data.detail) return data.detail;
    if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
      return data.non_field_errors.join(', ');
    }
    if (data.non_field_errors) return data.non_field_errors;
  }
  
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  
  return 'An unexpected error occurred';
};

// Export convenience methods
export const httpClient = UnifiedHttpClient;
export default UnifiedHttpClient;