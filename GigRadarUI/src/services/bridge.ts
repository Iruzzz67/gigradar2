import { Coordinates } from '../types';

declare global {
  interface Window {
    chrome?: {
      webview?: {
        postMessage: (message: any) => void;
        addEventListener: (event: string, handler: (e: any) => void) => void;
        removeEventListener: (event: string, handler: (e: any) => void) => void;
      };
    };
    MauiBridge?: {
      postMessage: (message: string) => void;
    };
  }
}

export interface BridgeMessage {
  command: string;
  payload?: any;
  requestId?: string;
}

export interface BridgeResponse<T = any> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
  } | null;
}

class NativeBridgeService {
  private isMauiEnvironment(): boolean {
    return !!(window.chrome?.webview?.postMessage || window.MauiBridge?.postMessage);
  }

  // --- Location / Geolocation ---
  async requestLocation(): Promise<{ coords: Coordinates; source: 'native' | 'browser' | 'fallback' }> {
    // 1. Try MAUI Bridge if embedded in .NET MAUI WebView
    if (this.isMauiEnvironment()) {
      try {
        const res = await this.sendCommand<Coordinates>('location.getCurrent');
        if (res.success && res.data) {
          return { coords: res.data, source: 'native' };
        }
      } catch (err) {
        console.warn('Native MAUI location bridge failed, falling back to browser API:', err);
      }
    }

    // 2. Try Browser Geolocation API
    if ('geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              },
              source: 'browser',
            });
          },
          (err) => {
            console.warn('Browser geolocation denied or error:', err.message);
            // Jakarta Music Scene fallback (Blok M / TIM)
            resolve({
              coords: { latitude: -6.2297, longitude: 106.8184 },
              source: 'fallback',
            });
          },
          { timeout: 7000, enableHighAccuracy: true }
        );
      });
    }

    // 3. Static fallback: Jakarta Center
    return {
      coords: { latitude: -6.2297, longitude: 106.8184 },
      source: 'fallback',
    };
  }

  // --- Haptics & Vibration ---
  hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light'): void {
    if (this.isMauiEnvironment()) {
      this.sendCommand('system.vibrate', { type }).catch(() => {});
      return;
    }
    if ('vibrate' in navigator) {
      if (type === 'success') navigator.vibrate([30, 50, 40]);
      else if (type === 'error') navigator.vibrate([60, 80, 60]);
      else navigator.vibrate(25);
    }
  }

  // --- Native Share ---
  async shareEvent(event: { name: string; url?: string; description?: string }): Promise<void> {
    if (this.isMauiEnvironment()) {
      await this.sendCommand('system.share', event);
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description || `Check out ${event.name} on GigRadar!`,
          url: event.url || window.location.href,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link event berhasil disalin ke clipboard!');
    }
  }

  // --- External Links ---
  openExternal(url: string): void {
    if (this.isMauiEnvironment()) {
      this.sendCommand('system.openExternalLink', { url }).catch(() => {});
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // --- Generic Bridge Dispatcher ---
  private sendCommand<T = any>(command: string, payload?: any): Promise<BridgeResponse<T>> {
    return new Promise((resolve) => {
      const requestId = 'req_' + Math.random().toString(36).substring(2, 9);
      const msg: BridgeMessage = { command, payload, requestId };

      if (window.chrome?.webview?.postMessage) {
        window.chrome.webview.postMessage(msg);
      } else if (window.MauiBridge?.postMessage) {
        window.MauiBridge.postMessage(JSON.stringify(msg));
      }

      // Safe timeout fallback
      setTimeout(() => {
        resolve({ success: false, data: null, error: { code: 'TIMEOUT', message: 'Bridge request timed out' } });
      }, 5000);
    });
  }
}

export const nativeBridge = new NativeBridgeService();
