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

export class TicTicError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
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

        const data = await response.json() as any;

        if (!response.ok) {
            const error = data.error;
            throw new TicTicError(
                error?.message || 'Request failed',
                response.status,
                error?.code
            );
        }

        // API returns { success: true, data: ... }
        return data.data as T;
    }

    /**
     * Send a WhatsApp message
     */
    async sendText(to: string, text: string): Promise<SendResult> {
        const result = await this.request<any>('/v1/messages', {
            method: 'POST',
            body: JSON.stringify({ to, text }), // Changed from 'message' to 'text'
        });

        return result;
    }

    /**
     * Check if WhatsApp session is ready
     */
    async isReady(): Promise<boolean> {
        try {
            const sessions = await this.request<any[]>('/v1/sessions');
            // Check if we have any connected session
            return sessions.some(s => s.status === 'connected');
        } catch (error) {
            if (error instanceof TicTicError && error.statusCode === 404) {
                return false;
            }
            throw error;
        }
    }

    /**
     * Connect to WhatsApp (shows QR code)
     */
    async connect(): Promise<void> {
        // Create session
        const session = await this.request<any>('/v1/sessions', {
            method: 'POST',
            body: JSON.stringify({}), // Empty body is fine
        });

        if (session.qr_code) {
            console.log('\n📱 Scan this QR code with WhatsApp:\n');
            await displayQRCode(session.qr_code);
            console.log('\nWaiting for scan...\n');

            // Instructions
            if (session.instructions) {
                console.log('Instructions:');
                session.instructions.forEach((step: string, i: number) => {
                    console.log(`${i + 1}. ${step}`);
                });
                console.log();
            }
        }

        // Poll for connection status
        let attempts = 0;
        const maxAttempts = 60; // 2 minutes timeout

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const ready = await this.isReady();
            if (ready) {
                console.log('✅ Connected to WhatsApp!\n');
                return;
            }

            attempts++;
        }

        throw new TicTicError('Connection timeout', 408);
    }

    /**
     * Get current usage
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
     * Static method to request verification code
     */
    static async requestCode(phone: string, options?: { baseUrl?: string }): Promise<void> {
        const baseUrl = options?.baseUrl || process.env.TICTIC_API_URL || 'https://api.tictic.dev';

        const response = await fetch(`${baseUrl}/v1/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });

        const data = await response.json() as any;

        if (!response.ok) {
            const error = data.error;
            throw new TicTicError(
                error?.message || 'Failed to send code',
                response.status,
                error?.code
            );
        }

        console.log(`✅ Verification code sent to ${phone} via WhatsApp!`);
        console.log('Check your WhatsApp messages.');
    }

    /**
     * Static method to verify code and get API key
     */
    static async verifyCode(phone: string, code: string, options?: { baseUrl?: string }): Promise<string> {
        const baseUrl = options?.baseUrl || process.env.TICTIC_API_URL || 'https://api.tictic.dev';

        const response = await fetch(`${baseUrl}/v1/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, verification_code: code }),
        });

        const data = await response.json() as any;

        if (!response.ok) {
            const error = data.error;
            throw new TicTicError(
                error?.message || 'Verification failed',
                response.status,
                error?.code
            );
        }

        // Extract API key from nested structure
        return data.data.api_key;
    }

    /**
     * @deprecated Use TicTic.requestCode() instead
     */
    static async signup(phone: string): Promise<string> {
        await TicTic.requestCode(phone);
        throw new Error(
            'Check your WhatsApp for the code, then call:\n' +
            `const apiKey = await TicTic.verifyCode("${phone}", "123456")`
        );
    }

    /**
     * @deprecated Use TicTic.verifyCode() instead
     */
    static async verify(phone: string, code: string): Promise<string> {
        return TicTic.verifyCode(phone, code);
    }
}

export default TicTic; 