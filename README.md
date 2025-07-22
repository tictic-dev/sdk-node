# @tictic/node

SDK simples para envio de mensagens WhatsApp em Node.js.

```bash
npm install @tictic/node
```

## Início Rápido

```javascript
import TicTic from "@tictic/node";

const tictic = new TicTic(); // Usa TICTIC_API_KEY da variável de ambiente

// Conecta se necessário
if (!(await tictic.isReady())) {
  await tictic.connect(); // Mostra QR code
}

// Envia mensagem
await tictic.sendText("5511999887766", "Olá! 👋");
```

## Obtendo sua Chave de API

```javascript
// 1. Solicita código de verificação
await TicTic.signup("5511999887766");

// 2. Verifique seu WhatsApp e insira o código
const apiKey = await TicTic.verify("5511999887766", "123456");

// 3. Salve a chave
process.env.TICTIC_API_KEY = apiKey;
```

## API Completa

### Construtor

- `new TicTic(apiKey?)` - Chave da API ou usa `TICTIC_API_KEY` da variável de ambiente

### Mensagens

- `tictic.sendText(para, mensagem)` - Envia uma mensagem WhatsApp
- `tictic.isReady()` - Verifica se está conectado ao WhatsApp
- `tictic.connect()` - Conecta ao WhatsApp (mostra QR code)

### Conta

- `TicTic.signup(telefone)` - Solicita código de verificação
- `TicTic.verify(telefone, codigo)` - Completa cadastro, retorna chave da API
- `tictic.getUsage()` - Verifica uso e limites

## Variáveis de Ambiente

```bash
TICTIC_API_KEY=tk_xxxxxx      # Sua chave de API
```

## Tratamento de Erros

```javascript
try {
  await tictic.sendText("5511999887766", "Olá!");
} catch (error) {
  if (error.name === "TicTicError") {
    console.log(`Erro ${error.statusCode}: ${error.message}`);
  }
}
```

## Requisitos

- Node.js 18+
- Terminal com suporte a Unicode (para QR codes)

---

## English Documentation

### Simple WhatsApp messaging for Node.js

```bash
npm install @tictic/node
```

### Quick Start

```javascript
import TicTic from "@tictic/node";

const tictic = new TicTic(); // Uses TICTIC_API_KEY env var

// Connect if needed
if (!(await tictic.isReady())) {
  await tictic.connect(); // Shows QR code
}

// Send message
await tictic.sendText("5511999887766", "Hello! 👋");
```

### Getting Your API Key

```javascript
// 1. Request verification code
await TicTic.signup("5511999887766");

// 2. Check your WhatsApp, then verify with the code
const apiKey = await TicTic.verify("5511999887766", "123456");

// 3. Save the key
process.env.TICTIC_API_KEY = apiKey;
```

### Complete API

**Constructor**

- `new TicTic(apiKey?)` - API key or uses `TICTIC_API_KEY` env var

**Messaging**

- `tictic.sendText(to, message)` - Send a WhatsApp message
- `tictic.isReady()` - Check if connected to WhatsApp
- `tictic.connect()` - Connect to WhatsApp (shows QR code)

**Account**

- `TicTic.signup(phone)` - Request verification code
- `TicTic.verify(phone, code)` - Complete signup, returns API key
- `tictic.getUsage()` - Check usage and limits

### Error Handling

```javascript
try {
  await tictic.sendText("5511999887766", "Hello!");
} catch (error) {
  if (error.name === "TicTicError") {
    console.log(`Error ${error.statusCode}: ${error.message}`);
  }
}
```

---

Construído para desenvolvedores que só querem enviar mensagens WhatsApp.  
_Built for developers who just want to send WhatsApp messages._
