#!/usr/bin/env node

import TicTic from '@tictic/node';
import readline from 'readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function signup() {
  console.log(`
╔══════════════════════════════════╗
║      Welcome to TicTic! 🚀      ║
║   WhatsApp API for Developers    ║
╚══════════════════════════════════╝
`);

  try {
    // Step 1: Get phone number
    const phone = await rl.question('📱 Enter your WhatsApp number (with country code): ');

    // Validate phone format
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new Error('Invalid phone number format. Example: 5511999887766');
    }

    // Step 2: Request verification
    console.log('\n⏳ Sending verification code...');
    await TicTic.requestVerification(cleanPhone);
    console.log(`✅ Code sent to ${phone} via WhatsApp!\n`);

    // Step 3: Get code from user
    const code = await rl.question('🔐 Enter the 6-digit code: ');

    // Step 4: Verify and create account
    console.log('\n⏳ Creating your account...');
    const { apiKey } = await TicTic.verifyAndCreateAccount(cleanPhone, code);

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    ✅ Account Created!                        ║
╚═══════════════════════════════════════════════════════════════╝

Your API Key:
${apiKey}

Save this in your environment:
export TICTIC_API_KEY="${apiKey}"

Or add to your .env file:
TICTIC_API_KEY=${apiKey}
`);

    // Step 5: Offer to test
    const test = await rl.question('Want to test sending a message now? (y/n): ');

    if (test.toLowerCase() === 'y') {
      // Create client with new key
      const tictic = new TicTic({ apiKey });

      // Initialize session
      console.log('\n🔄 Setting up WhatsApp...\n');
      await tictic.createSession(); // This shows QR automatically
      await tictic.waitForSession();

      // Get test number
      const testPhone = await rl.question('📱 Phone number to send test message: ');

      // Send test
      console.log('\n📤 Sending test message...');
      const result = await tictic.sendText(
        testPhone,
        'Hello from TicTic! 🎉\n\nYour WhatsApp API is ready to use! ✓✓'
      );

      console.log(`
✅ Message sent successfully!
Message ID: ${result.id}

${result.usage ? `📊 Usage: ${result.usage.used}/${result.usage.limit} messages this month` : ''}

🎉 You're all set! Check out the docs at https://docs.tictic.dev
`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.statusCode === 400) {
      console.log('\n💡 Tip: Make sure you entered the correct code');
    }
  } finally {
    rl.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  signup();
}

export default signup; 