import { Capacitor } from '@capacitor/core';
import { NotificationManager, NotificationPayload } from './types';
import { WebNotificationManager } from './WebNotificationManager';
import { CapacitorNotificationManager } from './CapacitorNotificationManager';

export class NotificationService {
  private static instance: NotificationService;
  private manager: NotificationManager;
  private initialized = false;

  private constructor() {
    // Detect platform and instantiate appropriate manager
    if (Capacitor.isNativePlatform()) {
      this.manager = new CapacitorNotificationManager();
    } else {
      this.manager = new WebNotificationManager();
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await this.manager.initialize();
      this.initialized = true;
    } catch (error) {
      console.error('[NotificationService] Failed to initialize:', error);
      throw error;
    }
  }

  async requestPermission(): Promise<boolean> {
    return this.manager.requestPermission();
  }

  async getToken(): Promise<string | null> {
    return this.manager.getToken();
  }

  onMessage(callback: (payload: NotificationPayload) => void): () => void {
    return this.manager.onMessage(callback);
  }

  onBackgroundMessage(callback: (payload: NotificationPayload) => void): void {
    if (this.manager.onBackgroundMessage) {
      this.manager.onBackgroundMessage(callback);
    }
  }

  isSupported(): boolean {
    return this.manager.isSupported();
  }

  // Helper method to check if we're running on a native platform
  static isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  // Helper method to get the current platform
  static getPlatform(): string {
    return Capacitor.getPlatform();
  }
}