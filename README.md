# Udaan.AI Backend

Node.js + Express + MongoDB backend for the Udaan.AI scheme-matching frontend.

## Included

- MongoDB/Mongoose models for users, profiles, schemes, match history and applications
- Google Sign-In verification and JWT sessions
- Public scheme listing
- Public `POST /api/match` endpoint so the existing Wizard can work before login
- Logged-in match history
- Profile create/update/read API
- Saved/applied scheme tracking
- Seed script with sample government-scheme records
- Render deployment config

> Important: seeded scheme eligibility rules are starter/demo data. Verify every production eligibility condition and benefit against official scheme sources before launch.

## 1. Install

```bash
npm install
cp .env.example .env
```

Fill `.env` with MongoDB Atlas, JWT secret, Google client ID and frontend origin.

## 2. Seed schemes

```bash
npm run seed
```

## 3. Run

```bash
npm run dev
```

API default: `http://localhost:5000`

## Main APIs

### Health
`GET /api/health`

### Google auth
`POST /api/auth/google`

```json
{ "credential": "GOOGLE_ID_TOKEN_FROM_FRONTEND" }
```

### Current user
`GET /api/auth/me`

Header: `Authorization: Bearer <jwt>`

### Profile
- `GET /api/profile`
- `POST /api/profile`
- `PUT /api/profile`

Authenticated.

### Schemes
- `GET /api/schemes`
- `GET /api/schemes/:idOrSlug`

### Match schemes
`POST /api/match`

Authentication is optional. If a valid Bearer token is supplied, history is stored.

Example:

```json
{
  "profile": {
    "age": 24,
    "gender": "female",
    "state": "Karnataka",
    "category": "SC",
    "annualIncome": 250000,
    "businessType": "Retail",
    "businessStage": "new",
    "fundingRequired": 500000,
    "occupation": "tailor",
    "startupRecognized": false
  }
}
```

### Match history
`GET /api/match/history`

Authenticated.

### Applications / saved schemes
- `GET /api/applications`
- `POST /api/applications`
- `PATCH /api/applications/:id`

Authenticated.

## Frontend integration

Add to the frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Create an API helper such as:

```ts
const API = import.meta.env.VITE_API_URL;

export async function matchSchemes(profile: unknown) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ profile })
  });

  if (!res.ok) throw new Error('Unable to match schemes');
  return res.json();
}
```

Then change the Wizard/Results flow so Wizard submits its completed profile to this endpoint and Results renders `response.matches`.


## Student scholarship API

After deployment, seed both datasets with `npm run seed:all` using the same MongoDB URI.

- `POST /api/match` — entrepreneur scheme matching
- `GET /api/scholarships` — list scholarships
- `POST /api/scholarships/match` — student scholarship matching

Both matching endpoints return frontend-compatible ranked results.
