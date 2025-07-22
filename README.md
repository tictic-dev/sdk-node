# @tictic/node

Dead simple WhatsApp messaging for Node.js. No setup drama, just works.

```bash
npm install @tictic/node
```

## Quick Start (Literally 30 seconds)

```javascript
import TicTic from "@tictic/node";

const tictic = new TicTic(); // Uses TICTIC_API_KEY env var

// This single line handles EVERYTHING
await tictic.quickSend("5511999887766", "Hello! 👋");
```

That's it. The SDK handles session management, QR codes, waiting - everything.

## Getting Your API Key

### Option 1: Interactive Signup (Recommended)

```bash
npx @tictic/node signup
```

This walks you through the entire process with QR codes and everything.

### Option 2: Manual Signup

```javascript
// 1. Request code
await TicTic.requestVerification("5511999887766");

// 2. User gets code via WhatsApp, then:
const { apiKey } = await TicTic.verifyAndCreateAccount(
  "5511999887766",
  "123456"
);

// 3. Save the API key
process.env.TICTIC_API_KEY = apiKey;
```

## Real-World Examples

### Send and Check Usage

```javascript
const tictic = new TicTic();

const result = await tictic.sendText("5511999887766", "Hello!");

// The API returns usage info with every message
if (result.usage) {
  console.log(`Used ${result.usage.used} of ${result.usage.limit} messages`);
  console.log(`${result.usage.remaining} remaining this month`);
}
```

### Manual Session Management

```javascript
// Sometimes you want more control
const tictic = new TicTic();

// Create session with QR code
await tictic.createSession(); // Shows QR in terminal

// Wait for user to scan
await tictic.waitForSession({ showProgress: true });

// Now send messages
await tictic.sendText("5511999887766", "Ready! ✓✓");
```

### Error Handling

```javascript
try {
  await tictic.sendText("5511999887766", "Hello!");
} catch (error) {
  if (error.name === "TicTicError") {
    console.log(`API Error (${error.statusCode}): ${error.message}`);

    if (error.statusCode === 429) {
      // Rate limited or quota exceeded
      const usage = await tictic.getUsage();
      console.log("Current usage:", usage);
    }
  }
}
```

### Debug Mode

```javascript
// See what's happening under the hood
const tictic = new TicTic({ debug: true });
```

## Complete API

### `new TicTic(config?)`

- `config.apiKey` - API key (or use `TICTIC_API_KEY` env)
- `config.baseUrl` - API URL (default: `https://api.tictic.dev`)
- `config.debug` - Enable debug logging

### Messaging

- `tictic.send({ to, message })` - Send message with full control
- `tictic.sendText(to, text)` - Simple text message
- `tictic.quickSend(to, text)` - Send with automatic session handling

### Sessions

- `tictic.createSession(showQR?)` - Create session (shows QR by default)
- `tictic.getSession()` - Check session status
- `tictic.waitForSession(options?)` - Wait for QR scan

### Account

- `TicTic.requestVerification(phone)` - Start signup
- `TicTic.verifyAndCreateAccount(phone, code)` - Complete signup
- `tictic.getUsage()` - Check usage and limits

## Environment Variables

```bash
TICTIC_API_KEY=tk_xxxxxx      # Your API key
TICTIC_API_URL=https://...    # Custom API URL (optional)
```

## Common Issues

**"API key required"**

```bash
export TICTIC_API_KEY=tk_your_key_here
# Or pass in constructor: new TicTic({ apiKey: 'tk_...' })
```

**"Session not ready"**

```javascript
// Use quickSend for automatic handling
await tictic.quickSend(phone, message);

// Or manage manually
await tictic.createSession();
await tictic.waitForSession();
```

**QR Code not showing**
Make sure your terminal supports Unicode. Try:

```javascript
await tictic.createSession(false); // Disable terminal QR
// Get QR data to display elsewhere
const session = await tictic.getSession();
console.log(session.qrCode); // data:image/png;base64,...
```

## Requirements

- Node.js 18+
- Terminal with Unicode support (for QR codes)

---

Built with ❤️ by developers who got tired of complicated WhatsApp integrations.
