# NOTA — Next.js + Firebase + Neon

This repository is a **Next.js (Pages Router)** voting application configured with:
- **Firebase Email/Password Authentication**
- **Neon PostgreSQL** for serverless database connectivity
- Election hosting and voting system
- Excel export for results
- Clean, minimal UI using Tailwind CSS

---

## Features

✅ **Firebase Email/Password Authentication**: Secure login system using Firebase Auth  
✅ **Neon PostgreSQL Database**: Serverless Postgres for storing elections and votes  
✅ **Private Election Links**: Share unique URLs with voters  
✅ **Duplicate Vote Prevention**: Email-based hashing prevents multiple votes  
✅ **Excel Export**: Download voting results as Excel files  
✅ **Responsive UI**: Clean, minimal interface built with Tailwind CSS  

---

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Firebase Project** with Email/Password Authentication enabled
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
3. Enable **Email/Password Authentication**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password** provider
   - Save changes
4. Get your Firebase config:
   - Go to **Project Settings** → **General**
   - Scroll to "Your apps" and copy the config values

### 4. Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the **Connection String** (DATABASE_URL)
4. Make sure to include `?sslmode=require` at the end

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
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Application Base URL
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

⚠️ **IMPORTANT**: Never commit `.env.local` to GitHub! It's already in `.gitignore`.

### 6. Set Up Database Schema

Run the SQL commands from `schema.sql` in your Neon database console:

```sql
CREATE TABLE elections (
  id text PRIMARY KEY,
  title text,
  data jsonb,
  closed boolean default false,
  created_by text,
  created_at timestamptz default now()
);

CREATE TABLE votes (
  id serial PRIMARY KEY,
  election_id text REFERENCES elections(id),
  email_hash text,
  vote_json jsonb,
  created_at timestamptz default now(),
  UNIQUE(election_id, email_hash)
);

CREATE INDEX idx_votes_election_id ON votes(election_id);
CREATE INDEX idx_elections_created_by ON elections(created_by);
CREATE INDEX idx_votes_email_hash ON votes(election_id, email_hash);
```

You can run this in the Neon SQL Editor, or the database will be automatically set up on first use.

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
│  ├─ login.tsx             # Email/Password login/signup page
│  ├─ host.tsx              # Create election page
│  ├─ vote.tsx              # Paste election link page
│  ├─ my-elections.tsx      # View hosted elections
│  ├─ election/[id].tsx     # Voting page for specific election
│  └─ api/
│     ├─ createElection.ts  # API: Create new election
│     ├─ submitVote.ts      # API: Submit vote (with email hash)
│     ├─ getElection.ts     # API: Get election details
│     └─ downloadResults.ts # API: Download results as Excel
├─ lib/
│  ├─ firebase.ts           # Firebase client configuration
│  └─ db.ts                 # Neon Postgres connection pool
├─ components/
│  ├─ Layout.tsx            # Page layout wrapper
│  └─ FormField.tsx         # Form field component
├─ styles/
│  └─ globals.css           # Global styles with Tailwind
├─ schema.sql               # Database schema (email_hash based)
├─ .env.local               # Environment variables (gitignored)
├─ .gitignore               # Git ignore file (protects secrets)
└─ package.json
```

---

## Usage Guide

### For Election Hosts

1. **Sign Up / Login**:
   - Go to `/login`
   - Create an account with email and password (min 6 characters)
   - Or login if you already have an account

2. **Create an Election**:
   - Click "Host an election"
   - Enter election title
   - Add positions and candidates
   - Click "Create Election" to generate a shareable link

3. **Share the Link**:
   - Copy the generated election link
   - Share it with voters via WhatsApp, email, etc.
   - Voters must be logged in to vote

4. **View Results**:
   - Go to "My Elections"
   - Click on your election
   - View vote counts
   - Download results as Excel

### For Voters

1. **Login**:
   - Open the election link shared by the host
   - If not logged in, click "Go to Login"
   - Sign up or login with your email

2. **Vote**:
   - Select your candidates for each position
   - Click "Submit Vote"
   - Vote is submitted anonymously (only email hash is stored)

3. **Duplicate Prevention**:
   - Each email can only vote once per election
   - If you try voting again, you'll see an error message

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

⚠️ **Important**: This application requires additional security measures for production:

1. **Email-Based Duplicate Prevention**:
   - Votes are stored with SHA-256 hashed emails
   - Each email can only vote once per election (enforced by database UNIQUE constraint)
   - Emails are never stored in plain text for voter privacy

2. **Environment Variables**:
   - Never commit `.env.local` to version control
   - All sensitive credentials (Firebase, Neon) must be kept secret
   - Use Vercel environment variables for production deployment

3. **Firebase Authentication**:
   - Email/Password auth is free (no billing required)
   - For production, consider enabling email verification
   - Add password reset functionality for better UX

4. **Rate Limiting**:
   - Add rate limiting to API routes to prevent abuse
   - Consider using Vercel Edge Config or upstash/redis for tracking

5. **Input Validation**:
   - Add proper input validation and sanitization
   - Use libraries like `zod` or `joi` for schema validation
   - Sanitize user inputs before storing in database

6. **Database Security**:
   - Neon connection string must be kept secret
   - SSL mode is required for secure connections
   - Consider using connection pooling limits in production

7. **CORS & Security Headers**:
   - Configure proper CORS policies in production
   - Add security headers in `next.config.ts`:
     - Content-Security-Policy
     - X-Frame-Options
     - X-Content-Type-Options

---

## Troubleshooting

### Firebase Authentication Issues

- Make sure Email/Password is enabled in Firebase Console
- Check browser console for authentication errors
- Verify `.env.local` has correct Firebase credentials

### Database Connection Errors

- Verify `DATABASE_URL` is correct and includes `?sslmode=require`
- Check Neon project is active (not in sleep mode)
- Ensure database schema is created (run `schema.sql`)
- Check connection limits in Neon dashboard

### Tailwind Styles Not Working

- Make sure `postcss.config.mjs` and `tailwind.config.ts` exist
- Restart dev server after config changes
- Check `globals.css` imports Tailwind directives
- Clear `.next` cache: `rm -rf .next` and restart

### "Database error" when voting

- Ensure database tables are created with `email_hash` column (not `phone_hash`)
- Verify user is logged in before voting
- Check browser console and terminal for error details

---

## Tech Stack

- **Framework**: Next.js 16.0.3 (Pages Router)
- **Language**: TypeScript 5
- **Authentication**: Firebase Auth (Email/Password)
- **Database**: Neon (Serverless PostgreSQL)
- **Styling**: Tailwind CSS v3.4.17
- **Export**: SheetJS (xlsx)
- **Build Tool**: Turbopack

---

## License

MIT

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## Support

For issues or questions, please open a GitHub issue or contact the maintainer.
