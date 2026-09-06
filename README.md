# AI Video Generator — GitHub Pages

A browser-first AI video generator for selling as a static web app.

## Features
- AI script/story generation through an OpenAI-compatible chat endpoint (BYO API key).
- FREE AUTO CREATE VIDEO without an API: local story draft, browser visuals, Canvas + MediaRecorder.
- YouTube Shorts 9:16 and Long Video 16:9 presets.
- Scene editor, image upload, image prompts, voice preview, JSON/TXT export.
- No Node.js, Render.com, database, or server required.

## Deploy to GitHub Pages
1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, and `app.js` from `public/` to the repository root (or publish the `public` folder with your preferred Pages setup).
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main` and `/root`, then Save.
5. Open the generated GitHub Pages URL.

## AI provider
The AI button sends the request from the user's browser to the URL configured in **AI Provider**. The buyer supplies their own compatible API key. The key is stored only in browser localStorage. For production SaaS, use a secure backend instead of exposing provider keys.

## Important
GitHub Pages is static hosting. It does not run Node/Express and it cannot keep a private AI key secret. The free video renderer is entirely client-side and exports WebM.
