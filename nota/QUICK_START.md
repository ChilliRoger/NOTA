# Quick Start Guide - NOTA Election Voting App

## Start the Application

### Easiest Method
Double-click `start-dev.bat` in the project folder

### Alternative Method
```powershell
cd E:\NOTA\nota
npm run dev
```

Then open: http://localhost:3000

## What's Been Fixed

✅ All TypeScript errors resolved
✅ Firebase initialization simplified
✅ SSR (Server-Side Rendering) issues fixed
✅ App Router conflict removed
✅ Directory navigation issues resolved

## How to Use

### 1. Login
- Go to http://localhost:3000
- Click "Login with Phone Number"
- Enter phone with country code (e.g., +919876543210)
- Click "Send OTP"
- Enter the 6-digit OTP you receive
- Click "Verify OTP"

### 2. Create Election (Host)
- After login, click "Host an Election"
- Enter election title
- Add positions (e.g., "President", "Secretary")
- Add candidates for each position
- Click "Create Election"
- Copy the shareable link

### 3. Vote in Election
- Click "Vote in Election"
- Paste the election link
- Verify your phone with OTP
- Select your choices
- Click "Submit Vote"

### 4. Manage Your Elections
- Click "My Elections"
- View all your created elections
- See vote counts
- Close voting when done
- Download results as Excel file

## Important Notes

- **Phone Format**: Must include country code (+91 for India)
- **Duplicate Votes**: Each phone can vote only once per election
- **Closed Elections**: Cannot vote in closed elections
- **Private Links**: Only people with the link can vote

## Troubleshooting

**Can't start the app?**
- Make sure you're in `E:\NOTA\nota` directory
- Run `npm install` first
- Use the `start-dev.bat` file

**Firebase errors?**
- Check `.env.local` file exists
- Verify Firebase credentials are correct
- Enable Phone Authentication in Firebase Console

**Database errors?**
- Run `node setup-db.js` to create tables
- Check DATABASE_URL in `.env.local`

## Environment Setup

Make sure `.env.local` file has all these variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
DATABASE_URL=...
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

## Need Help?

Check `FIXES_APPLIED.md` for detailed information about all the fixes and features.

---

**The app is ready to use! 🎉**
