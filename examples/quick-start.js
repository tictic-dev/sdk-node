#!/usr/bin/env node

import TicTic from '@tictic/node';

// The simplest way to send a WhatsApp message
async function main() {
  const tictic = new TicTic(); // Uses TICTIC_API_KEY from env

  // This handles everything: session check, QR code, waiting
  const result = await tictic.quickSend(
    '5511999887766',
    'Hello from TicTic! 🚀'
  );

  console.log('✓✓ Message sent!', result.id);
}

main().catch(console.error); 