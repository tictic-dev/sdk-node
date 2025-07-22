#!/usr/bin/env node

import TicTic from '@tictic/node';

async function main() {
  const tictic = new TicTic(); // Uses TICTIC_API_KEY from env

  // Check if connected to WhatsApp
  if (!await tictic.isReady()) {
    console.log('Connecting to WhatsApp...');
    await tictic.connect(); // Shows QR code
  }

  // Send message
  const result = await tictic.sendText('5511999887766', 'Hello! 🚀');
  console.log('✓ Sent!', result.id);

  // Check usage
  const usage = await tictic.getUsage();
  console.log(`Usage: ${usage.used}/${usage.limit}`);
}

main().catch(console.error); 