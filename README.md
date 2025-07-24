# TicTic ✓✓ - Node SDK

SDK para mensagens WhatsApp via HTTP API. Baseado em whatsapp-web.js.

```bash
npm install @tictic/sdk
```

## Início Rápido

### 1. Obter chave de API

```javascript
import TicTic from '@tictic/sdk';

await TicTic.requestCode('5511999887766');
const apiKey = await TicTic.verifyCode('5511999887766', '123456');
```

### 2. Conectar WhatsApp

```javascript
const tictic = new TicTic(apiKey);
await tictic.connect(); // Exibe QR code
```

### 3. Enviar mensagens

```javascript
await tictic.sendText('5511999887766', 'Olá!');
```

## Exemplo Completo

```javascript
import TicTic from '@tictic/sdk';

async function main() {
  const tictic = new TicTic(); // Usa TICTIC_API_KEY do env

  // Conectar se necessário
  if (!(await tictic.isReady())) {
    await tictic.connect();
  }

  // Enviar mensagem
  const result = await tictic.sendText('5511999887766', 'Olá! ✓✓');
  console.log('Mensagem enviada:', result);
}

main().catch(console.error);
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
const tictic = new TicTic(apiKey?); // Usa TICTIC_API_KEY se não fornecido

// Verificar se conectado
const ready = await tictic.isReady();

// Obter status detalhado (para debug)
const status = await tictic.getStatus();
// Retorna: { ready: boolean, status: string, phone?: string, next_step?: string }

// Conectar ao WhatsApp
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
try {
  await tictic.sendText('5511999887766', 'Olá!');
} catch (error) {
  if (error.name === 'TicTicError') {
    console.error(`Erro ${error.code}: ${error.message}`);

    if (error.help) {
      console.error(`Ajuda: ${error.help}`);
    }
  }
}
```

## Script de Configuração

Use o script interativo para começar:

```bash
node examples/signup.js
```

Processo:

1. Solicita seu número de telefone
2. Envia código via WhatsApp
3. Gera sua chave de API
4. Mostra como usar

## Requisitos

- Node.js 18+
- Terminal com suporte Unicode
- Conta WhatsApp

## Limitações

- Baseado em whatsapp-web.js (não oficial)
- Requer sessão ativa do WhatsApp Web
- Use por sua conta e risco

---

## English Documentation

### WhatsApp messaging SDK for Node.js

HTTP API for WhatsApp messages. Built on whatsapp-web.js.

```bash
npm install @tictic/sdk
```

### Quick Start

#### 1. Get API key

```javascript
import TicTic from '@tictic/sdk';

await TicTic.requestCode('5511999887766');
const apiKey = await TicTic.verifyCode('5511999887766', '123456');
```

#### 2. Connect WhatsApp

```javascript
const tictic = new TicTic(apiKey);
await tictic.connect(); // Shows QR code
```

#### 3. Send messages

```javascript
await tictic.sendText('5511999887766', 'Hello!');
```

### Complete Example

```javascript
import TicTic from '@tictic/sdk';

async function main() {
  const tictic = new TicTic(); // Uses TICTIC_API_KEY from env

  // Connect if needed
  if (!(await tictic.isReady())) {
    await tictic.connect();
  }

  // Send message
  const result = await tictic.sendText('5511999887766', 'Hello! ✓✓');
  console.log('Message sent:', result);
}

main().catch(console.error);
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
const tictic = new TicTic(apiKey?); // Uses TICTIC_API_KEY if not provided

// Check if connected
const ready = await tictic.isReady();

// Get detailed status (for debugging)
const status = await tictic.getStatus();
// Returns: { ready: boolean, status: string, phone?: string, next_step?: string }

// Connect to WhatsApp
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
try {
  await tictic.sendText('5511999887766', 'Hello!');
} catch (error) {
  if (error.name === 'TicTicError') {
    console.error(`Error ${error.code}: ${error.message}`);

    if (error.help) {
      console.error(`Help: ${error.help}`);
    }
  }
}
```

### Setup Script

Use the interactive setup script:

```bash
node examples/signup.js
```

Process:

1. Request your phone number
2. Send code via WhatsApp
3. Generate your API key
4. Show how to use it

### Requirements

- Node.js 18+
- Terminal with Unicode support
- WhatsApp account

### Limitations

- Built on whatsapp-web.js (unofficial)
- Requires active WhatsApp Web session
- Use at your own risk

## Development

### Commit Conventions

This project uses [Conventional Commits](https://conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update readme"
```

### Release Process

Automated via GitHub Actions when pushed to `main`.

## License

MIT
