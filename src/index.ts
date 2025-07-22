/**
 * @tictic/node - Simple WhatsApp messaging SDK
 */

import { displayQRCode } from './qr.js';

export interface TicTicConfig {
    apiKey?: string;
    baseUrl?: string;
    debug?: boolean;
}

export interface Message {
    to: string;
    message: string;
}

export interface SendResult {
    id: string;
    timestamp: string;
    to: string;
}

export interface SessionStatus {
    status: 'initializing' | 'ready' | 'failed' | 'not_found';
    qrCode?: string;
    connectedAt?: string;
}

export interface SignupResult {
    apiKey: string;
    phone: string;
}

export interface UsageInfo {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
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
    private debug: boolean;

    constructor(config: TicTicConfig = {}) {
        this.apiKey = config.apiKey || process.env.TICTIC_API_KEY || '';
        this.baseUrl = config.baseUrl || process.env.TICTIC_API_URL || 'https://api.tictic.dev';
        this.debug = config.debug || false;

        if (!this.apiKey) {
            throw new Error(
                'API key required. Pass it in config or set TICTIC_API_KEY env var.\n' +
                'Get your API key: npx @tictic/node signup'
            );
        }
    }

    private log(...args: any[]): void {
        if (this.debug) {
            console.log('[TicTic]', ...args);
        }
    }

    private async request<T>(
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        this.log(`${options.method || 'GET'} ${url}`);

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add API key for authenticated endpoints
        if (this.apiKey && !path.startsWith('/v1/auth/')) {
            headers['X-API-Key'] = this.apiKey;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();
        this.log('Response:', response.status, data);

        if (!response.ok || !data.success) {
            throw new TicTicError(
                data.error || 'Request failed',
                response.status
            );
        }

        return data.data;
    }

    /**
     * Send a WhatsApp message
     * @returns Message details including usage info
     */
    async send(message: Message): Promise<SendResult & { usage?: UsageInfo }> {
        // The API returns usage info with every message
        const result = await this.request<any>('/v1/messages', {
            method: 'POST',
            body: JSON.stringify(message),
        });

        // Extract the main result and usage separately
        const { usage, ...messageResult } = result;

        if (usage) {
            this.log(`Usage: ${usage.used}/${usage.limit} (${usage.percentage}%)`);
        }

        return { ...messageResult, usage };
    }

    /**
     * Send a simple text message
     */
    async sendText(to: string, text: string): Promise<SendResult & { usage?: UsageInfo }> {
        return this.send({ to, message: text });
    }

    /**
     * Create a new WhatsApp session
     * @param showQR - Display QR code in terminal (default: true)
     */
    async createSession(showQR = true): Promise<SessionStatus> {
        const session = await this.request<SessionStatus>('/v1/sessions', {
            method: 'POST',
        });

        if (showQR && session.qrCode) {
            console.log('\n📱 Scan this QR code with WhatsApp:\n');
            await displayQRCode(session.qrCode);
            console.log('\nWaiting for authentication...\n');
        }

        return session;
    }

    /**
     * Get current session status
     */
    async getSession(): Promise<SessionStatus> {
        return this.request<SessionStatus>('/v1/sessions', {
            method: 'GET',
        });
    }

    /**
     * Wait for session to be ready
     */
    async waitForSession(
        options: {
            timeout?: number;
            interval?: number;
            showProgress?: boolean;
        } = {}
    ): Promise<void> {
        const {
            timeout = 300000, // 5 minutes
            interval = 2000,
            showProgress = true
        } = options;

        const startTime = Date.now();
        let dots = 0;

        while (Date.now() - startTime < timeout) {
            const status = await this.getSession();

            if (status.status === 'ready') {
                if (showProgress) {
                    console.log('\n✅ WhatsApp connected successfully!\n');
                }
                return;
            }

            if (status.status === 'failed') {
                throw new TicTicError('Session authentication failed', 400);
            }

            if (showProgress) {
                // Animated waiting indicator
                process.stdout.write(`\rWaiting for QR scan${'.'.repeat(dots % 4)}   `);
                dots++;
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new TicTicError('Session initialization timeout', 408);
    }

    /**
     * Initialize session if needed and send message
     * Convenience method for quick usage
     */
    async quickSend(to: string, message: string): Promise<SendResult> {
        try {
            // Check if session exists
            const session = await this.getSession();

            if (session.status !== 'ready') {
                console.log('Setting up WhatsApp connection...');
                await this.createSession();
                await this.waitForSession();
            }

            // Send message
            return await this.sendText(to, message);
        } catch (error) {
            if (error instanceof TicTicError && error.statusCode === 404) {
                // No session exists, create one
                console.log('Creating WhatsApp session...');
                await this.createSession();
                await this.waitForSession();
                return await this.sendText(to, message);
            }
            throw error;
        }
    }

    // Static signup methods (no API key needed)
    static async requestVerification(phone: string, baseUrl?: string): Promise<{ phone: string }> {
        const url = baseUrl || process.env.TICTIC_API_URL || 'https://api.tictic.dev';

        const response = await fetch(`${url}/v1/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new TicTicError(data.error || 'Request failed', response.status);
        }

        return data.data;
    }

    static async verifyAndCreateAccount(
        phone: string,
        code: string,
        baseUrl?: string
    ): Promise<SignupResult> {
        const url = baseUrl || process.env.TICTIC_API_URL || 'https://api.tictic.dev';

        const response = await fetch(`${url}/v1/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, verification_code: code }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new TicTicError(data.error || 'Request failed', response.status);
        }

        return {
            apiKey: data.data.api_key,
            phone: data.data.phone,
        };
    }

    /**
     * Get current usage statistics
     */
    async getUsage(): Promise<{
        plan: string;
        current_month: string;
        usage: UsageInfo;
        history: Array<{ month: string; count: number }>;
    }> {
        return this.request('/v1/usage');
    }
}

// Re-export for convenience
export default TicTic; 