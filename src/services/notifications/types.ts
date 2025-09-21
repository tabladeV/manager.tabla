// Notification types shared across platforms
export interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, any>;
}

export interface NotificationManager {
  initialize(): Promise<void>;
  requestPermission(): Promise<boolean>;
  getToken(): Promise<string | null>;
  onMessage(callback: (payload: NotificationPayload) => void): () => void;
  onBackgroundMessage?(callback: (payload: NotificationPayload) => void): void;
  isSupported(): boolean;
}

export interface NotificationData {
  notification_id: string;
  restaurant_id?: string;
  restaurant_name?: string;
  notification_type: string;
  reservation_id?: string;
  created_at?: string;
  [key: string]: any;
}