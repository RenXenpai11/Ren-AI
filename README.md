# Aura AI

Aura AI is a modern SvelteKit chat application with a polished multi-session interface and a server-side AI route powered by Groq.

## Overview

The app provides a conversational UI with:

- Conversation history organized by time groups
- Responsive sidebar and mobile-friendly layout
- Light and dark theme toggle with persisted preference
- Per-chat message persistence in browser local storage
- Streaming-like typing animation for assistant responses
- Prompt shortcuts for quick interaction

Backend chat handling is implemented in a SvelteKit API route at `src/routes/api/chat/+server.js`, currently configured to use Groq with the `llama-3.3-70b-versatile` model.

## Tech Stack

- Svelte 5
- SvelteKit 2
- Vite 7
- Groq SDK
- ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Start development server

```bash
npm run dev
```

App will be available at the local URL printed by Vite (typically `http://localhost:5173`).

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run Prettier check and ESLint
- `npm run format` - Format the codebase with Prettier

## API Route

### POST `/api/chat`

Request body:

```json
{
	"message": "Your prompt text"
}
```

Response body:

```json
{
	"reply": "Assistant response"
}
```

If the API call fails, the UI surfaces an error message in the active chat.

## Project Structure

```text
src/
	lib/
		components/
			ChatArea.svelte
			ChatInput.svelte
			Sidebar.svelte
	routes/
		+layout.svelte
		+page.svelte
		api/
			chat/
				+server.js
```

## Notes

- Chat history and active session state are stored in local storage.
- Theme preference is persisted per browser.
- Do not expose private API keys in client-side code.

## License

No license file is currently included. Add a `LICENSE` file if you plan to distribute this project publicly.
