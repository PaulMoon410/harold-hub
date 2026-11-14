# Base44 Integration Setup

## Overview

This setup uses Base44's managed backend for chat logic and data storage, while keeping your static frontend on Render. This minimizes both Base44 credits (no heavy AI generation) and integration complexity.

## Files

- `functions/chat.js` — Base44 backend function for chat processing
- `script.js` — Frontend that calls Base44 API
- `base44.config.json` — Base44 project configuration

## Setup Steps

### 1. Install Base44 CLI

```bash
npm install -g base44@latest
base44 login
base44 create
```

### 2. Deploy Backend

```bash
base44 deploy
```

This will give you a URL like `https://app.base44.com/api/functions/chat`

### 3. Update Frontend

In `script.js`, update the `base44ApiUrl` with your deployed URL:

```javascript
this.base44ApiUrl = 'https://app.base44.com/api/functions/chat';
```

### 4. Deploy Frontend on Render

Use the existing `render.yaml` to deploy your static frontend on Render.

## How It Works

1. Browser → Render-hosted frontend
2. Frontend → Base44 API (`/api/functions/chat`)
3. Base44 processes message, saves to database
4. Base44 returns response
5. Frontend displays response

## Credit Optimization

- Base44 credits are only used for the backend function execution, not AI generation
- Your static frontend on Render uses no Base44 credits
- The chat logic is simple code, not heavy AI generation
- Database storage is included in Base44's managed backend

## Local Machine Integration

For local machine communication, you can:

1. Use Base44's built-in WebSocket support (Actors)
2. Or set up a simple webhook on your local machine that Base44 calls
3. Or use Base44's realtime subscriptions for database changes