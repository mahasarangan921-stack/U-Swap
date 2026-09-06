# U SWAP

Send files to anyone using just a unique code. No accounts, no installs.

## Stack
MERN — MongoDB, Express, React, Node.js

## Structure
```
U SWAP/
├── server/          Express API (upload, verify, download, cleanup)
│   ├── models/File.js
│   ├── routes/upload.js
│   ├── routes/download.js
│   ├── utils/generateCode.js    6-char code + secure link token generation
│   ├── utils/cleanupJob.js      hourly cron purging expired files
│   └── server.js
└── client/          React (Vite) frontend
    ├── src/pages/Home.jsx        Send / Receive choice
    ├── src/pages/Send.jsx        upload flow, progress bar, code+link result
    ├── src/pages/Receive.jsx     6-digit code entry, verify, download
    ├── src/pages/ReceiveByLink.jsx  direct link (/r/:token) flow
    └── src/components/CodeDisplay.jsx  hero "beacon" code reveal
```

## Key feature: dual code + link
Every upload returns BOTH:
- a 6-character code (ambiguous chars like 0/O, 1/I/L stripped, safe to read aloud)
- a secure shareable link (`/r/:token`) for WhatsApp/email/etc.

Either one downloads the same file. Both expire and self-delete together.

## Run locally

**Server**
```bash
cd server
cp .env.example .env   # edit MONGO_URI if needed
npm install
npm run dev             # nodemon, http://localhost:5000
```

**Client**
```bash
cd client
npm install
npm run dev              # http://localhost:5173
```

Requires a local or hosted MongoDB instance (update `MONGO_URI` in `.env`).

## API

| Method | Route | Description |
|---|---|---|
| POST | `/api/upload` | multipart file upload → `{ code, link, filename, size, expiresAt }` |
| GET | `/api/verify/:code` | check a code is valid before downloading |
| GET | `/api/verify/link/:token` | check a link token is valid |
| GET | `/api/download/code/:code` | stream file by code, then delete |
| GET | `/api/download/link/:token` | stream file by link token, then delete |

## Version 1 behavior
- Local disk storage (`server/uploads/`) — swap for S3/Blob later without touching routes, just the storage layer in `upload.js`
- Files expire after 24h (configurable via `FILE_EXPIRY_HOURS`)
- Files are deleted immediately after first successful download
- Hourly cron job purges anything expired but never downloaded
