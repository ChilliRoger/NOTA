# NOTA - Secure Online Voting Platform

A production-ready voting application built with Next.js, Firebase Authentication, and PostgreSQL. NOTA provides a secure, anonymous voting system with multi-layer fraud prevention for hosting private elections.

## Overview

NOTA is a serverless voting platform designed for organizations, student councils, clubs, and groups that need secure online elections. The system ensures one vote per person through a three-layer security approach: email verification, device fingerprinting, and IP tracking.

## Key Features

- **Secure Authentication**: Firebase Email/Password authentication with email verification
- **Multi-Layer Security**: Device fingerprinting and IP tracking to prevent duplicate votes
- **Anonymous Voting**: Votes are stored with cryptographic hashes, ensuring voter privacy
- **Excel Reports**: Download comprehensive voting results as formatted Excel spreadsheets
- **Real-Time Results**: Live vote tracking with visual bar graphs for election hosts
- **Serverless Architecture**: Built on Vercel and Neon for automatic scaling
- **Modern UI**: Clean, professional interface with responsive design

## Technology Stack

- **Frontend**: Next.js 16.0.3 (Pages Router), React 19, TypeScript 5
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Neon PostgreSQL (Serverless)
- **Styling**: Tailwind CSS 3.4
- **Data Export**: SheetJS (xlsx)
- **Build Tool**: Turbopack

## Prerequisites

Before starting, ensure you have:

- Node.js 18 or higher
- npm or yarn package manager
- Firebase account with project created
- Neon PostgreSQL account with database created
- Git for version control

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/nota.git
cd nota
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Firebase SDK for authentication
- PostgreSQL client (pg)
- UUID for unique identifiers
- XLSX for Excel export
- Tailwind CSS for styling

### 3. Firebase Configuration

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Email/Password authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
   - Configure email verification settings
4. Obtain Firebase configuration:
   - Project Settings > General
   - Copy your app configuration values

### 4. Database Setup

1. Go to [Neon Console](https://console.neon.tech/)
2. Create new project
3. Copy database connection string
4. Ensure SSL mode is enabled

### 5. Environment Configuration

Create `.env.local` file in root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

# Database Configuration
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Application Configuration
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

**Important**: Never commit `.env.local` to version control. This file contains sensitive credentials.

### 6. Database Schema

Execute the following SQL in your Neon database console:

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
  device_hash text,
  ip_address text,
  vote_json jsonb,
  created_at timestamptz default now(),
  UNIQUE(election_id, email_hash),
  UNIQUE(election_id, device_hash)
);

CREATE INDEX idx_votes_election_id ON votes(election_id);
CREATE INDEX idx_elections_created_by ON elections(created_by);
CREATE INDEX idx_votes_email_hash ON votes(election_id, email_hash);
CREATE INDEX idx_votes_device_hash ON votes(election_id, device_hash);
CREATE INDEX idx_votes_ip_address ON votes(election_id, ip_address);
```

### 7. Start Development Server

```bash
npm run dev
```

Access the application at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/nota
├── pages/
│   ├── _app.tsx                 # Application wrapper
│   ├── _document.tsx            # HTML document configuration
│   ├── index.tsx                # Landing page
│   ├── login.tsx                # Authentication page
│   ├── host.tsx                 # Election creation
│   ├── vote.tsx                 # Vote submission page
│   ├── my-elections.tsx         # Election management
│   ├── election/[id].tsx        # Voting interface
│   ├── results/[id].tsx         # Results visualization
│   └── api/
│       ├── createElection.ts    # Create election endpoint
│       ├── submitVote.ts        # Submit vote endpoint
│       ├── getResults.ts        # Fetch election details
│       ├── getElectionResults.ts # Download results data
│       ├── getElectionWithHost.ts # Election with host info
│       ├── getVoteCounts.ts     # Vote count aggregation
│       ├── getMyElections.ts    # User's elections
│       └── closeElection.ts     # Close election endpoint
├── lib/
│   ├── firebase.ts              # Firebase configuration
│   └── db.ts                    # Database connection pool
├── components/
│   ├── Layout.tsx               # Page layout wrapper
│   └── FormField.tsx            # Form field component
├── utils/
│   ├── excel.ts                 # Excel export utility
│   └── deviceFingerprint.ts     # Device fingerprinting
├── styles/
│   └── globals.css              # Global styles
├── schema.sql                   # Database schema
├── .env.local                   # Environment variables (not tracked)
├── .gitignore                   # Git ignore rules
└── package.json                 # Dependencies
```

## Usage Guide

### For Election Hosts

1. **Account Creation**
   - Navigate to login page
   - Create account with valid email address
   - Verify email through Firebase verification link

2. **Create Election**
   - Click "Host an Election"
   - Enter election title and description
   - Add positions and candidates
   - Generate shareable election link

3. **Manage Election**
   - Access "My Elections" to view all hosted elections
   - Share election link with eligible voters
   - Monitor real-time vote counts and statistics
   - Close election when voting period ends

4. **Export Results**
   - View results with visual bar graphs
   - Download formatted Excel report
   - Share results with stakeholders

### For Voters

1. **Authentication**
   - Open election link provided by host
   - Create account or login with existing credentials
   - Verify email address if required

2. **Cast Vote**
   - Review all positions and candidates
   - Select preferred candidates
   - Submit vote (action is irreversible)

3. **Security**
   - Each email can vote only once per election
   - Device fingerprinting prevents multi-device voting
   - IP tracking limits network-based fraud

## API Documentation

### POST /api/createElection

Creates new election in database.

**Request**:
```json
{
  "id": "uuid-string",
  "title": "Student Council Election 2025",
  "positions": [
    {
      "name": "President",
      "candidates": ["Alice Johnson", "Bob Smith", "NOTA"]
    }
  ],
  "createdBy": "host@example.com"
}
```

**Response**:
```json
{
  "ok": true
}
```

### POST /api/submitVote

Submits vote with security validation.

**Request**:
```json
{
  "id": "election-uuid",
  "votes": { "0": 1, "1": 0 },
  "email": "voter@example.com",
  "deviceFingerprint": "device-hash"
}
```

**Response**:
```json
{
  "ok": true
}
```

### GET /api/getElectionResults?id={election-id}

Returns aggregated voting results.

**Response**:
```json
{
  "results": [
    {
      "Position": "President",
      "Candidate": "Alice Johnson",
      "Votes": 45
    }
  ]
}
```

### POST /api/closeElection

Closes election and prevents further voting.

**Request**:
```json
{
  "id": "election-uuid"
}
```

**Response**:
```json
{
  "ok": true
}
```

## Deployment

### Vercel Deployment

1. **Prepare Repository**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Deploy on Vercel**
   - Import GitHub repository in Vercel dashboard
   - Configure environment variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_BASE_URL` to production URL
   - Deploy application

3. **Post-Deployment Configuration**
   - Add Vercel domain to Firebase authorized domains
   - Verify database connection in production
   - Test authentication flow
   - Enable email verification in Firebase

## Security Considerations

### Three-Layer Security System

1. **Email Verification**
   - Firebase email verification required before voting
   - SHA-256 hashing of email addresses
   - UNIQUE database constraint prevents duplicate votes

2. **Device Fingerprinting**
   - Browser and hardware characteristics tracked
   - One vote per device per election enforced
   - Fingerprints stored as SHA-256 hashes

3. **IP Address Tracking**
   - Soft limit of 3 votes per IP address
   - Prevents network-level voting fraud
   - Does not block legitimate shared networks

### Data Protection

- All voter identifiers stored as cryptographic hashes
- No plain text email addresses in votes table
- Votes cannot be traced back to individual voters
- Database connections require SSL encryption
- Environment variables never committed to repository

### Production Recommendations

1. **Rate Limiting**: Implement API rate limiting using Vercel Edge Config
2. **Input Validation**: Add schema validation with Zod or Joi
3. **CORS Policy**: Configure strict CORS rules in production
4. **Security Headers**: Add CSP, X-Frame-Options, and other headers
5. **Audit Logging**: Implement logging for security events
6. **Backup Strategy**: Regular database backups in Neon

## Troubleshooting

### Common Issues

**Firebase Authentication Errors**
- Verify Email/Password provider is enabled in Firebase Console
- Check Firebase configuration in `.env.local`
- Ensure authorized domains include localhost and production URL
- Review Firebase quotas and limits

**Database Connection Failures**
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon project status (active vs. sleeping)
- Confirm database schema is created
- Review connection pool limits

**Email Verification Issues**
- Check Firebase email templates are enabled
- Verify spam/junk folders
- Review Firebase Console logs for delivery failures
- Ensure Firebase domain is not blacklisted

**Build Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`
- Verify all environment variables are set

## Performance Optimization

- Serverless architecture scales automatically
- Database queries use indexed columns
- Static assets cached by CDN
- Image optimization via Next.js Image component
- Code splitting for faster page loads

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests:
- Open a GitHub issue
- Contact maintainer via email
- Review existing documentation

## Acknowledgments

Built with Next.js, Firebase, PostgreSQL, and open-source technologies.
