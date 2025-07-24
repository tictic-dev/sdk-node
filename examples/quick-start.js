#!/usr/bin/env node

import TicTic from '@tictic/sdk';

async function main() {
  try {
    const tictic = new TicTic(); // Uses TICTIC_API_KEY from env

    // Connect if needed
    if (!await tictic.isReady()) {
      console.log('📱 Connecting to WhatsApp...');
      await tictic.connect(); // Just shows QR, handles everything
    }

    // Send message
    const result = await tictic.sendText('5511999887766', 'Hello from TicTic ✓✓!');
    console.log('✅ Message sent!', result);

  } catch (error) {
    if (error.name === 'TicTicError') {
      console.error(`❌ Error (${error.code}): ${error.message}`);
      if (error.help) {
        console.error(`💡 ${error.help}`);
      }
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

main().catch(console.error); 