/**
 * @tictic/node - Simple WhatsApp messaging SDK
 */

import { displayQRCode } from './qr.js';

export interface SendResult {
    id: string;
    timestamp: string;
    to: string;
    usage?: {
        used: number;
        limit: number;
        remaining: number;
    };
}

export interface SessionStatus {
    status: 'initializing' | 'ready' | 'failed';
    qrCode?: string;
}

export class TicTicError extends Error {
    constructor(
        message: string,
        public statusCode: number
    ) {
        super(message);
        this.name = 'TicTicError';
    }
}

export class TicTic {
    private apiKey: string;
    private baseUrl = 'https://api.tictic.dev';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.TICTIC_API_KEY || '';
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

        if (!response.ok) {
            const error = await response.text();
            throw new TicTicError(error || 'Request failed', response.status);
        }

        return response.json() as T;
    }

    /**
     * Send a WhatsApp message
     */
    async sendText(to: string, message: string): Promise<SendResult> {
        return this.request<SendResult>('/v1/messages', {
            method: 'POST',
            body: JSON.stringify({ to, message }),
        });
    }

    /**
     * Check if WhatsApp session is ready
     */
    async isReady(): Promise<boolean> {
        try {
            const status = await this.request<SessionStatus>('/v1/sessions');
            return status.status === 'ready';
        } catch (error) {
            if (error instanceof TicTicError && error.statusCode === 404) {
                return false; // No session exists
            }
            throw error;
        }
    }

    /**
     * Connect to WhatsApp (shows QR code)
     */
    async connect(): Promise<void> {
        // Create session
        const session = await this.request<SessionStatus>('/v1/sessions', {
            method: 'POST',
        });

        if (session.qrCode) {
            console.log('\n📱 Scan this QR code with WhatsApp:\n');
            await displayQRCode(session.qrCode);
            console.log('\nWaiting for scan...\n');
        }

        // Wait for ready
        while (true) {
            const status = await this.request<SessionStatus>('/v1/sessions');

            if (status.status === 'ready') {
                console.log('✅ Connected!\n');
                break;
            }

            if (status.status === 'failed') {
                throw new TicTicError('Connection failed', 400);
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    /**
     * Get current usage
     */
    async getUsage(): Promise<{
        used: number;
        limit: number;
        remaining: number;
    }> {
        const data = await this.request<any>('/v1/usage');
        return data.usage;
    }

    // Signup (no API key needed)
    static async signup(phone: string): Promise<string> {
        // Step 1: Request code
        const response1 = await fetch('https://api.tictic.dev/v1/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });

        if (!response1.ok) {
            const error = await response1.text();
            throw new TicTicError(error || 'Failed to send code', response1.status);
        }

        console.log(`Code sent to ${phone} via WhatsApp!`);

        // For now, throw an error asking user to use the verification method
        // In a real implementation, you'd want to either:
        // 1. Accept the code as a parameter
        // 2. Use readline to prompt for it
        // 3. Return a partial signup object that can be completed
        throw new Error(
            'Check your WhatsApp for the code, then call:\n' +
            `TicTic.verify("${phone}", "123456")`
        );
    }

    static async verify(phone: string, code: string): Promise<string> {
        const response = await fetch('https://api.tictic.dev/v1/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, verification_code: code }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new TicTicError(error || 'Verification failed', response.status);
        }

        const data = await response.json() as { api_key: string };
        return data.api_key;
    }
}

export default TicTic; 