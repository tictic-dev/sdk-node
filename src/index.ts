/**
 * @tictic/sdk - Simple WhatsApp messaging SDK
 */

import { displayQRCode } from './qr.js';

export interface SendResult {
  id: string;
  to: string;
  status: string;
  created_at: string;
}

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
}

export interface StatusInfo {
  ready: boolean;
  status: string;
  phone?: string;
  next_step?: string;
}

export class TicTicError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public help?: string,
  ) {
    super(message);
    this.name = 'TicTicError';
  }
}

export class TicTic {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, options?: { baseUrl?: string }) {
    this.apiKey = apiKey || process.env.TICTIC_API_KEY || '';
    this.baseUrl = options?.baseUrl || process.env.TICTIC_API_URL || 'https://api.tictic.dev';

    if (!this.apiKey) {
      throw new Error('API key required. Set TICTIC_API_KEY or pass to constructor.');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      const error = data.error;
      throw new TicTicError(
        error?.message || 'Request failed',
        response.status,
        error?.code || error?.type,
        error?.help,
      );
    }

    return data.data as T;
  }

  /**
   * Send a WhatsApp message
   */
  async sendText(to: string, text: string): Promise<SendResult> {
    return await this.request<SendResult>('/v1/messages', {
      method: 'POST',
      body: JSON.stringify({ to, text }),
    });
  }

  /**
   * Check if WhatsApp is connected and ready
   */
  async isReady(): Promise<boolean> {
    try {
      const status = await this.request<StatusInfo>('/v1/status');
      return status.ready;
    } catch {
      return false;
    }
  }

  /**
   * Get detailed connection status
   */
  async getStatus(): Promise<StatusInfo> {
    return await this.request<StatusInfo>('/v1/status');
  }

  /**
   * Connect to WhatsApp (shows QR code if needed)
   */
  async connect(): Promise<void> {
    // Get QR code (session created automatically if needed)
    const qrData = await this.request<any>('/v1/qr');

    if (qrData.status === 'already_connected') {
      console.log('✅ Already connected to WhatsApp!\n');
      return;
    }

    if (qrData.qr) {
      console.log('\n📱 Scan this QR code with WhatsApp:\n');
      await displayQRCode(qrData.qr);

      if (qrData.instructions) {
        console.log('\nInstructions:');
        qrData.instructions.forEach((step: string, i: number) => {
          console.log(`${i + 1}. ${step}`);
        });
      }

      console.log('\n⏳ Waiting for scan...\n');
    }

    // Poll for connection
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const status = await this.request<StatusInfo>('/v1/status');
      if (status.ready) {
        console.log('✅ Connected to WhatsApp!\n');
        if (status.phone) {
          console.log(`📱 Connected as: ${status.phone}\n`);
        }
        return;
      }

      attempts++;
    }

    throw new TicTicError('Connection timeout', 408, 'TIMEOUT');
  }

  /**
   * Get current usage statistics
   */
  async getUsage(): Promise<UsageInfo> {
    const data = await this.request<any>('/v1/usage');
    return {
      used: data.usage.used,
      limit: data.usage.limit,
      remaining: data.usage.remaining,
    };
  }

  /**
   * Request verification code
   */
  static async requestCode(phone: string, options?: { baseUrl?: string }): Promise<void> {
    const baseUrl = options?.baseUrl || process.env.TICTIC_API_URL || 'https://api.tictic.dev';

    const response = await fetch(`${baseUrl}/v1/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      const error = data.error;
      throw new TicTicError(
        error?.message || 'Failed to send code',
        response.status,
        error?.code || error?.type,
      );
    }

    console.log(`✅ Verification code sent to ${phone} via WhatsApp!`);
    console.log('📱 Check your WhatsApp messages.');
  }

  /**
   * Verify code and get API key
   */
  static async verifyCode(
    phone: string,
    code: string,
    options?: { baseUrl?: string },
  ): Promise<string> {
    const baseUrl = options?.baseUrl || process.env.TICTIC_API_URL || 'https://api.tictic.dev';

    const response = await fetch(`${baseUrl}/v1/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, verification_code: code }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      const error = data.error;
      throw new TicTicError(
        error?.message || 'Verification failed',
        response.status,
        error?.code || error?.type,
      );
    }

    return data.data.api_key;
  }
}

export default TicTic;
