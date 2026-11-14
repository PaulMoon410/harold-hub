# Harold Portal

A static portal for Harold that can be deployed on Render.

## Features

- Clean, modern chat interface
- Responsive design
- Real-time message simulation
- Typing indicators
- Mobile-friendly

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and visual design
- `script.js` - Chat functionality and message handling

## Deployment on Render

This repository is the portal/Hub, not the running Harold model or the VS Code
consensus pool. The model server is maintained in `PaulMoon410/peake_ai` on
`lubuntu`, port 10000. Its lightweight Ollama-compatible interface uses the
base URL `https://lubuntu.tail239f3d.ts.net/ollama` and model `harold`; clients
must send Harold's configured bearer API key. No Ollama installation or model
download is needed. See that repository's `OLLAMA_ADAPTER.md` for supported
requests and limitations.

### Option 1: Static Site (Recommended)

1. Create a new **Static Site** in Render
2. Connect your Git repository
3. Set the following:
   - **Build Command**: `echo "No build needed"` (or leave empty)
   - **Publish Directory**: `.` (root)
4. Deploy!

### Option 2: Web Service

If you want to add backend functionality later:

1. Create a new **Web Service** in Render
2. Connect your Git repository
3. Add a `Dockerfile` or use a static file server like:
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```
4. Deploy!

## Local Development

Open `index.html` directly in your browser, or use a simple HTTP server:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

## Customization

To integrate with the actual Harold API, modify `script.js` to replace the simulated responses with actual API calls to your Harold instance.

## License

MIT