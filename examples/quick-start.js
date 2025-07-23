#!/usr/bin/env node

import TicTic from '@tictic/node';

async function main() {
  try {
    // Initialize with your API key
    const tictic = new TicTic(); // Uses TICTIC_API_KEY from env

    // Check if connected to WhatsApp
    if (!await tictic.isReady()) {
      console.log('📱 Connecting to WhatsApp...');
      await tictic.connect(); // Shows QR code
    }

    // Send message
    console.log('📤 Sending message...');
    const result = await tictic.sendText('5511999887766', 'Hello from TicTic! 🚀');
    console.log('✅ Message sent!', result);

    // Check usage
    const usage = await tictic.getUsage();
    console.log(`\n📊 Usage: ${usage.used}/${usage.limit} messages this month`);
    console.log(`   Remaining: ${usage.remaining}`);

  } catch (error) {
    if (error.name === 'TicTicError') {
      console.error(`❌ Error (${error.code}): ${error.message}`);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

main(); 