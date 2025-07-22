#!/usr/bin/env node

import TicTic from '@tictic/node';

async function signup() {
  console.log('🚀 TicTic Signup\n');

  try {
    // Step 1: Request verification code
    await TicTic.signup('5511999887766');

    // Step 2: User checks WhatsApp, then verifies
    // (In real usage, you'd get this code from user input)
    const apiKey = await TicTic.verify('5511999887766', '123456');

    console.log('✅ Account created!');
    console.log('Your API key:', apiKey);
    console.log('\nSave this:');
    console.log(`export TICTIC_API_KEY="${apiKey}"`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

signup(); 