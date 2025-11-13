# NOTA — Next.js + Firebase + Neon (Starter)

This repository is a minimal, working **Next.js (Pages Router)** starter configured with:
- Firebase Phone Authentication (OTP)
- Neon (Postgres) connectivity via `pg` (server-side API routes)
- Basic pages: Home, Host (create election), Vote (paste link), Election detail (voting)
- Host-only close & download results (Excel via SheetJS)
- Minimal, Google-Forms-like UI using Tailwind CSS

---

## Features

✅ **Firebase Phone Authentication**: Secure OTP-based login using Firebase Auth  
✅ **Neon PostgreSQL Database**: Serverless Postgres for storing elections and votes  
✅ **Private Election Links**: Share unique URLs with voters  
✅ **Real-time Voting**: Submit votes with phone verification  
✅ **Excel Export**: Download voting results as Excel files  
✅ **Responsive UI**: Clean, minimal interface built with Tailwind CSS  

---

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Firebase Project** with Phone Authentication enabled
4. **Neon Database** account and connection string

---

## Quick Setup (Local Development)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd nota
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- `firebase` - Firebase SDK for authentication
- `pg` - PostgreSQL client for Neon
- `uuid` - Generate unique election IDs
- `xlsx` - Excel file generation
- `cookie`, `js-cookie` - Cookie handling
- `tailwindcss`, `postcss`, `autoprefixer` - Styling

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Phone Authentication**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Phone** provider
   - Add your domain to authorized domains (for local: `localhost`)
4. Get your Firebase config:
   - Go to **Project Settings** → **General**
   - Scroll to "Your apps" and copy the config values

### 4. Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the **Connection String** (DATABASE_URL)
4. Run the schema (see Database Setup section below)

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

# Neon Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# Application Base URL
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

### 6. Set Up Database Schema

Run the SQL commands from `schema.sql` in your Neon database:

```sql
CREATE TABLE elections (
  id text PRIMARY KEY,
  title text,
  data jsonb,
  closed boolean default false
);

CREATE TABLE votes (
  id serial PRIMARY KEY,
  election_id text REFERENCES elections(id),
  vote_json jsonb,
  created_at timestamptz default now()
);

CREATE INDEX idx_votes_election_id ON votes(election_id);
```

You can run this in the Neon SQL Editor.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
/nota
├─ pages/
│  ├─ _app.tsx              # App wrapper with global styles
│  ├─ index.tsx             # Home page (landing)
│  ├─ host.tsx              # Create election page
│  ├─ vote.tsx              # Paste election link page
│  ├─ election/[id].tsx     # Voting page for specific election
│  └─ api/
│     ├─ createElection.ts  # API: Create new election
│     ├─ submitVote.ts      # API: Submit vote
│     ├─ closeElection.ts   # API: Close election & get results
│     └─ getResults.ts      # API: Fetch election details
├─ lib/
│  ├─ firebase.ts           # Firebase client configuration
│  └─ db.ts                 # Neon Postgres connection
├─ components/
│  ├─ Layout.tsx            # Page layout wrapper
│  └─ FormField.tsx         # Form field component
├─ utils/
│  └─ excel.ts              # Excel export utility
├─ styles/
│  └─ globals.css           # Global styles with Tailwind
├─ tailwind.config.js       # Tailwind configuration
├─ postcss.config.js        # PostCSS configuration
├─ schema.sql               # Database schema
├─ .env.local               # Environment variables (gitignored)
└─ package.json
```

---

## Usage Guide

### For Election Hosts

1. **Create an Election**:
   - Click "Host an election"
   - Enter election title
   - Add positions and candidates
   - Click "Create" to generate a private link

2. **Share the Link**:
   - Copy the generated election link
   - Share it with voters via WhatsApp, email, etc.

3. **Close Election & Download Results**:
   - Use the `closeElection` API to close voting
   - Download results as Excel file using the `downloadResultsAsXLSX` utility

### For Voters

1. **Vote in an Election**:
   - Click "Vote in election" or open the election link directly
   - Enter your phone number (E.164 format, e.g., +919876543210)
   - Click "Send OTP"
   - Enter the OTP received
   - Select your candidates
   - Click "Submit vote"

---

## API Routes

### POST `/api/createElection`
Creates a new election in the database.

**Request Body**:
```json
{
  "id": "uuid-string",
  "title": "Student Council Election",
  "positions": [
    {
      "name": "President",
      "candidates": ["Alice", "Bob", "NOTA"]
    }
  ]
}
```

**Response**:
```json
{
  "ok": true
}
```

### POST `/api/submitVote`
Submits a vote for an election.

**Request Body**:
```json
{
  "id": "election-uuid",
  "votes": {
    "0": 1,
    "1": 0
  }
}
```

**Response**:
```json
{
  "ok": true
}
```

### GET `/api/getResults?id={election-id}`
Fetches election details (title and positions).

**Response**:
```json
{
  "election": {
    "title": "Student Council Election",
    "positions": [...]
  }
}
```

### POST `/api/closeElection`
Closes an election and returns all votes.

**Request Body**:
```json
{
  "id": "election-uuid"
}
```

**Response**:
```json
{
  "ok": true,
  "votes": [
    {"0": 1, "1": 0},
    {"0": 2, "1": 1}
  ]
}
```

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from `.env.local`
   - Make sure `NEXT_PUBLIC_APP_BASE_URL` is set to your production URL (e.g., `https://nota.vercel.app`)
5. Click "Deploy"

### 3. Configure Firebase for Production

1. Add your Vercel domain to Firebase authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel URL (e.g., `nota.vercel.app`)

---

## Security Notes & Production Considerations

⚠️ **Important**: This starter is minimal and requires additional security measures for production:

1. **Phone Number Verification**:
   - Currently, votes are stored without tying to phone numbers
   - For production, store phone number (or hash) in votes table to prevent duplicate voting
   - Use Firebase ID tokens server-side: verify with `admin.auth().verifyIdToken()`

2. **reCAPTCHA Configuration**:
   - Firebase Phone Auth requires reCAPTCHA
   - Configure reCAPTCHA v3 in Firebase Console for better UX
   - Test thoroughly in production environment

3. **Rate Limiting**:
   - Add rate limiting to API routes to prevent abuse
   - Consider using Vercel Edge Config or Redis

4. **Input Validation**:
   - Add proper input validation and sanitization
   - Use libraries like `zod` or `joi` for schema validation

5. **CORS & Security Headers**:
   - Configure proper CORS policies
   - Add security headers in `next.config.ts`

6. **Database Security**:
   - Neon connection string should be kept secret
   - Use environment variables, never commit credentials
   - Enable SSL mode for database connections in production

---

## Troubleshooting

### Firebase reCAPTCHA Issues
- Ensure your domain is in Firebase authorized domains
- Check browser console for reCAPTCHA errors
- For local development, use `localhost` (not `127.0.0.1`)

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check Neon project is active and not sleeping
- Ensure database schema is created

### Tailwind Styles Not Working
- Make sure `postcss.config.js` and `tailwind.config.js` exist
- Restart dev server after config changes
- Check `globals.css` imports Tailwind directives

---

## Tech Stack

- **Framework**: Next.js 16 (Pages Router)
- **Language**: TypeScript
- **Authentication**: Firebase Auth (Phone OTP)
- **Database**: Neon (Serverless Postgres)
- **Styling**: Tailwind CSS
- **Export**: SheetJS (xlsx)

---

## License

MIT

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## Support

For issues or questions, please open a GitHub issue or contact the maintainer.
