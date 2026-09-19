# Udaan Backend v2 Upgrade

This version keeps the existing public matching flows and adds persistent account data.

## MongoDB database

Set on Render:

- `MONGODB_DB_NAME=udaan`

The backend also defaults to `udaan` if this variable is missing. Existing data in the old `test` database is not deleted; on startup the 15 schemes and 12 scholarships are seeded into `udaan`.

## Persistent account features

When a user is signed in with Google:

- `/api/match` stores entrepreneur profile + match history.
- `/api/scholarships/match` stores student profile + match history.
- `/api/applications` saves business schemes.
- `/api/scholarship-applications` saves scholarships.
- `/api/profile` returns the user's entrepreneur and student profiles.
- `/api/match/history` returns both kinds of match history.

## Required Render variables

- `MONGODB_URI`
- `MONGODB_DB_NAME=udaan`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=7d`
- `GOOGLE_CLIENT_ID`
- `FRONTEND_URL=https://surajkr12444-prog.github.io`
