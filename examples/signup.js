#!/usr/bin/env node

import TicTic from '@tictic/sdk';
import readline from 'readline/promises';

async function signup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log('🚀 TicTic Account Setup\n');

    // Get phone number
    const phone = await rl.question('📱 Enter your WhatsApp number (e.g., 5511999887766): ');

    // Request verification code
    console.log('\n📤 Requesting verification code...');
    await TicTic.requestCode(phone);

    // Get verification code from user
    const code = await rl.question('\n🔢 Enter the 6-digit code from WhatsApp: ');

    // Verify and get API key
    console.log('\n🔐 Verifying code...');
    const apiKey = await TicTic.verifyCode(phone, code);

    console.log('\n✅ Success! Your account is ready.\n');
    console.log('🔑 Your API key:', apiKey);
    console.log('\n📝 To use it, set this environment variable:');
    console.log(`   export TICTIC_API_KEY="${apiKey}"`);
    console.log('\n📄 Or add it to your .env file:');
    console.log(`   TICTIC_API_KEY=${apiKey}`);

  } catch (error) {
    if (error.name === 'TicTicError') {
      console.error(`\n❌ Error (${error.code}): ${error.message}`);
      if (error.help) {
        console.error(`💡 ${error.help}`);
      }
    } else {
      console.error('\n❌ Error:', error.message);
    }
  } finally {
    rl.close();
  }
}

signup().catch(console.error); 