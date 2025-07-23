# TicTic ✓✓ - Node SDK

SDK simples para mensagens WhatsApp em Node.js. Envie mensagens em minutos, não horas.

```bash
npm install @tictic/node
```

## Início Rápido

### 1. Obtenha sua Chave de API

```javascript
import TicTic from "@tictic/node";

// Solicitar código de verificação
await TicTic.requestCode("5511999887766");

// Verifique seu WhatsApp pelo código, depois confirme
const apiKey = await TicTic.verifyCode("5511999887766", "123456");

// Salve sua chave de API
process.env.TICTIC_API_KEY = apiKey;
```

### 2. Envie Mensagens

```javascript
const tictic = new TicTic(); // Usa TICTIC_API_KEY da variável de ambiente

// Conecte ao WhatsApp (apenas na primeira vez)
if (!(await tictic.isReady())) {
  await tictic.connect(); // Mostra QR code
}

// Enviar mensagem
await tictic.sendText("5511999887766", "Olá! 👋");
```

## Exemplo Completo

```javascript
import TicTic from "@tictic/node";

async function main() {
  try {
    const tictic = new TicTic(process.env.TICTIC_API_KEY);

    // Garantir conexão
    if (!(await tictic.isReady())) {
      console.log("Escaneie o QR code com WhatsApp...");
      await tictic.connect();
    }

    // Enviar mensagem
    const result = await tictic.sendText(
      "5511999887766",
      "Pedido confirmado! 📦"
    );
    console.log("Mensagem enviada:", result.id);

    // Verificar uso
    const usage = await tictic.getUsage();
    console.log(`Usado ${usage.used} de ${usage.limit} mensagens`);
  } catch (error) {
    console.error("Erro:", error.message);
  }
}

main();
```

## Referência da API

### Autenticação

```javascript
// Solicitar código de verificação
await TicTic.requestCode(telefone);

// Verificar código e obter chave de API
const apiKey = await TicTic.verifyCode(telefone, codigo);
```

### Métodos do Cliente

```javascript
// Inicializar cliente
const tictic = new TicTic(apiKey?);

// Verificar conexão
const isConnected = await tictic.isReady();

// Conectar ao WhatsApp (mostra QR code)
await tictic.connect();

// Enviar mensagem de texto
const result = await tictic.sendText(para, texto);

// Verificar uso
const { used, limit, remaining } = await tictic.getUsage();
```

## Variáveis de Ambiente

```bash
TICTIC_API_KEY=tk_xxxxx       # Sua chave de API
TICTIC_API_URL=https://...    # URL da API (opcional)
```

## Tratamento de Erros

```javascript
import TicTic from "@tictic/node";

try {
  await tictic.sendText("5511999887766", "Olá!");
} catch (error) {
  if (error.name === "TicTicError") {
    console.error(`Erro ${error.code}: ${error.message}`);

    // Tratar erros específicos
    switch (error.code) {
      case "USAGE_LIMIT_EXCEEDED":
        console.log("Limite mensal atingido. Faça upgrade do seu plano.");
        break;
      case "WHATSAPP_ERROR":
        console.log("WhatsApp não conectado. Execute connect() primeiro.");
        break;
    }
  }
}
```

## Requisitos

- Node.js 18+
- Terminal com suporte Unicode (para QR codes)
- Conta WhatsApp

## Licença

MIT

---

## English Documentation

### Simple WhatsApp messaging SDK for Node.js

Send messages in minutes, not hours.

```bash
npm install @tictic/node
```

### Quick Start

#### 1. Get Your API Key

```javascript
import TicTic from "@tictic/node";

// Request verification code
await TicTic.requestCode("5511999887766");

// Check WhatsApp for code, then verify
const apiKey = await TicTic.verifyCode("5511999887766", "123456");

// Save your API key
process.env.TICTIC_API_KEY = apiKey;
```

#### 2. Send Messages

```javascript
const tictic = new TicTic(); // Uses TICTIC_API_KEY env var

// Connect to WhatsApp (first time only)
if (!(await tictic.isReady())) {
  await tictic.connect(); // Shows QR code
}

// Send message
await tictic.sendText("5511999887766", "Hello! 👋");
```

### Complete Example

```javascript
import TicTic from "@tictic/node";

async function main() {
  try {
    const tictic = new TicTic(process.env.TICTIC_API_KEY);

    // Ensure connected
    if (!(await tictic.isReady())) {
      console.log("Scan the QR code with WhatsApp...");
      await tictic.connect();
    }

    // Send message
    const result = await tictic.sendText(
      "5511999887766",
      "Order confirmed! 📦"
    );
    console.log("Message sent:", result.id);

    // Check usage
    const usage = await tictic.getUsage();
    console.log(`Used ${usage.used} of ${usage.limit} messages`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
```

### API Reference

#### Authentication

```javascript
// Request verification code
await TicTic.requestCode(phone);

// Verify code and get API key
const apiKey = await TicTic.verifyCode(phone, code);
```

#### Client Methods

```javascript
// Initialize client
const tictic = new TicTic(apiKey?);

// Check connection
const isConnected = await tictic.isReady();

// Connect to WhatsApp (shows QR code)
await tictic.connect();

// Send text message
const result = await tictic.sendText(to, text);

// Check usage
const { used, limit, remaining } = await tictic.getUsage();
```

### Environment Variables

```bash
TICTIC_API_KEY=tk_xxxxx       # Your API key
TICTIC_API_URL=https://...    # API URL (optional)
```

### Error Handling

```javascript
import TicTic from "@tictic/node";

try {
  await tictic.sendText("5511999887766", "Hello!");
} catch (error) {
  if (error.name === "TicTicError") {
    console.error(`Error ${error.code}: ${error.message}`);

    // Handle specific errors
    switch (error.code) {
      case "USAGE_LIMIT_EXCEEDED":
        console.log("Monthly limit reached. Upgrade your plan.");
        break;
      case "WHATSAPP_ERROR":
        console.log("WhatsApp not connected. Run connect() first.");
        break;
    }
  }
}
```

### Requirements

- Node.js 18+
- Terminal with Unicode support (for QR codes)
- WhatsApp account

### License

MIT
