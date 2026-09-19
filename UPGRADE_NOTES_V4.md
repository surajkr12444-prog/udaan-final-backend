# Udaan Backend v4

Added:
- Email/password signup: `POST /api/auth/signup`
- Email/password login: `POST /api/auth/login`
- Passwords are hashed with Node.js `scrypt` + random salt; raw passwords are never stored.
- Existing Google Sign-In remains available and can link to an existing email account after Google verifies that email.
- Multilingual assistant endpoint: `POST /api/assistant/chat`
- Optional Gemini integration via `GEMINI_API_KEY`; the assistant falls back to built-in Hindi/Hinglish/English guidance when no key is configured.

Existing Render variables stay the same. No client secret is required for Google Identity Services.
