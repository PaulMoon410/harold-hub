# Harold AI Pool

A pool of AI apps that can communicate with each other. The first app is
**Harold Portal** - a chat interface with an extensions system.

## Structure

- `index.html` / `public/index.html` - Main portal page
- `script.js` / `public/script.js` - Chat logic + extensions loader
- `styles.css` / `public/styles.css` - Styling
- `public/extensions/registry.json` - Extension registry (served as static JSON)
- `server.js` - Express server with chat API, FTP integration, WebSocket
- `ftp-server.js` - FTP server module

## Extensions System

Extensions are VS Code plug-ins registered in `public/extensions/registry.json`.
Each entry has:

- `name` - extension name
- `type` - e.g. "vscode-extension"
- `description` - what it does
- `publisher` - publisher name
- `setup` - command to install it

To register a new extension, add an entry to `registry.json`. The Harold Portal
UI loads the registry and displays registered extensions in the Extensions panel.

## Apps in the Pool

| App | Purpose |
|-----|---------|
| Harold Portal | Chat interface with extensions support |

## How to Run

```bash
cd "Harold Hub"
npm install
node server.js
```

Then open `http://localhost:3000` (or serve `public/` statically).

## Adding New Apps

1. Create a new folder in this repo
2. Add its own `index.html`, `script.js`, `styles.css`
3. Register it in the pool so other apps can communicate with it
4. Apps communicate via the `/api/webhook` endpoint and WebSocket events