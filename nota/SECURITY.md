# Security Policy

## Protecting Sensitive Data

This project contains sensitive information that **MUST NOT** be committed to GitHub:

### 🔒 Protected Files (in `.gitignore`)

1. **`.env.local`** - Contains Firebase and Neon database credentials
2. **`setup-db-email.js`** - Database setup script
3. **`test-db.js`** - Database testing script
4. **`TESTING.md`** - May contain test credentials

### ✅ Safe to Commit

1. **`.env.example`** - Template file with placeholder values
2. **`schema.sql`** - Database schema (no credentials)
3. **`README.md`** - Documentation
4. All source code in `pages/`, `components/`, `lib/`

---

## Before Pushing to GitHub

### 1. Verify .env.local is NOT tracked

```bash
git status
```

You should NOT see `.env.local` in the list. If you do:

```bash
git rm --cached .env.local
```

### 2. Check for exposed secrets

```bash
git check-ignore .env.local
```

Should output: `.gitignore:36:.env.local    .env.local`

### 3. Review changes before committing

```bash
git diff
```

Make sure no API keys, passwords, or connection strings are visible.

---

## Environment Variables

### Required Variables

All sensitive data is stored in `.env.local`:

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase sender ID
- `DATABASE_URL` - Neon PostgreSQL connection string (contains password)

### For New Contributors

1. Copy `.env.example` to `.env.local`
2. Get credentials from project admin
3. Never commit `.env.local`

---

## Database Security

### Email Privacy

- Voter emails are **never stored in plain text**
- SHA-256 hash is used for duplicate prevention
- Only the host's email is stored (for election ownership)

### Connection Security

- Neon requires SSL (`?sslmode=require` in DATABASE_URL)
- Connection pooling prevents resource exhaustion
- Credentials must be rotated if exposed

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer privately
3. Provide details about the vulnerability
4. Wait for confirmation before disclosure

---

## Production Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel
- [ ] `.env.local` is in `.gitignore`
- [ ] No credentials in source code
- [ ] Firebase auth domain includes production URL
- [ ] Neon database connection uses SSL
- [ ] Rate limiting configured on API routes
- [ ] Input validation implemented
- [ ] Security headers configured in `next.config.ts`

---

## Credential Rotation

If credentials are exposed:

1. **Firebase**:
   - Regenerate API keys in Firebase Console
   - Update authorized domains
   - Revoke old keys

2. **Neon Database**:
   - Reset password in Neon Console
   - Update `DATABASE_URL` in all environments
   - Check connection logs for suspicious activity

3. **Update All Environments**:
   - Update `.env.local` for local development
   - Update Vercel environment variables
   - Notify team members

---

## Git History Cleanup

If sensitive data was committed by mistake:

```bash
# DO NOT USE unless absolutely necessary
# This rewrites git history and requires force push

# Install BFG Repo-Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/

# Remove sensitive file from history
bfg --delete-files .env.local

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (breaks for collaborators!)
git push origin --force --all
```

**Better approach**: Delete and recreate the repository if exposure just occurred.

---

## Security Best Practices

1. **Never**:
   - Commit `.env.local` or `.env`
   - Include passwords in code comments
   - Log sensitive data to console in production
   - Share credentials via insecure channels

2. **Always**:
   - Use environment variables for secrets
   - Review code before pushing
   - Rotate credentials regularly
   - Keep dependencies updated
   - Use HTTPS in production

---

Last Updated: November 13, 2025
