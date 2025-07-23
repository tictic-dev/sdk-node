/**
 * QR code display utilities
 */

import qrcode from 'qrcode-terminal';

/**
 * Display QR code in terminal
 */
export function displayQRCode(data: string): Promise<void> {
  return new Promise((resolve) => {
    // Remove data URL prefix if present
    const qrData = data.startsWith('data:')
      ? Buffer.from(data.split(',')[1], 'base64').toString()
      : data;

    qrcode.generate(qrData, { small: false }, () => {
      resolve();
    });
  });
}
