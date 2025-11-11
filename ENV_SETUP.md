# Environment Variables Setup Guide

## Required Environment Variables

This project requires the following environment variables to be set:

### Firebase Configuration (Required for Database Access)

**Required for accessing the Firestore database where contracts are stored.**

**How to set it up:**

1. **Get your Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (or create a new one)
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - If you don't have a web app, click "Add app" and select the web icon `</>`
   - Copy the configuration values

2. **Create a `.env.local` file in the root directory:**

   **On Windows (PowerShell):**
   ```powershell
   # Copy the example file
   Copy-Item .env.example .env.local
   # Then edit .env.local with your actual values
   ```

   **On Mac/Linux:**
   ```bash
   cp .env.example .env.local
   # Then edit .env.local with your actual values
   ```

   Or manually create a file named `.env.local` in the root directory with:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBlBLHLshXnwgeozROf6RlU2U0G1Xw6lAk
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=meterscan-nl.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=meterscan-nl
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=meterscan-nl.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_APP_ID=1:433158636303:web:903d51f4ec57e12ef9347a
   ```

3. **Restart your development server:**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

### RESEND_API_KEY

Required for sending emails through Resend.

**How to set it up:**

1. **Get your Resend API Key:**
   - Go to [Resend Dashboard](https://resend.com/api-keys)
   - Sign up or log in
   - Create a new API key
   - Copy the API key

2. **Create a `.env.local` file in the root directory:**
   
   **On Windows (PowerShell):**
   ```powershell
   # In the root directory of your project (same level as package.json)
   echo "RESEND_API_KEY=re_your_actual_api_key_here" > .env.local
   ```
   
   **On Mac/Linux:**
   ```bash
   echo "RESEND_API_KEY=re_your_actual_api_key_here" > .env.local
   ```
   
   Or manually create a file named `.env.local` in the root directory with:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

3. **Restart your development server:**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

## File Location

Create the `.env.local` file in the root directory of your project:
```
Servicecontracten/
├── .env.local          ← Create this file here
├── package.json
├── next.config.ts
└── ...
```

## Important Notes

- `.env.local` is gitignored and will not be committed to version control
- Never commit your actual API keys to the repository
- For production deployments (Vercel, etc.), add the environment variable in your hosting platform's settings
- The `.env.local` file takes precedence over `.env` files

## Verification

After setting up the environment variable, restart your dev server and check the console. You should no longer see the warning:
```
RESEND_API_KEY is not defined in environment variables
```

## Production Deployment

When deploying to production (e.g., Vercel):

1. Go to your project settings
2. Navigate to Environment Variables
3. Add `RESEND_API_KEY` with your production API key value
4. Redeploy your application



