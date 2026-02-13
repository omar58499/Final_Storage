# Railway Deployment Guide

## Steps to Deploy Backend on Railway

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Railway Project
```bash
railway init
```
- Choose "Node.js" as the service
- Give it a name like "file-manager-server"

### 4. Set Environment Variables
```bash
railway variables
```

Add these variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- `JWT_SECRET` - A secure random string for JWT (generate one)
- `CLIENT_URL` - Your Netlify frontend URL (e.g., https://yoursite.netlify.app)

### 5. Deploy
```bash
railway up
```

Railway will provide a URL like: `https://file-manager-server.railway.app`

### 6. Configure Netlify
On Netlify dashboard:
1. Go to **Site Settings → Build & Deploy → Environment**
2. Add environment variable:
   - **Key**: `VITE_API_URL`  
   - **Value**: Your Railway URL from step 5
3. Trigger a new deploy

That's it! Your signup/login will now work on Netlify.

## Alternative Hosting Options
- **Render**: https://render.com (similar to Railway)
- **Fly.io**: https://fly.io (good for Node apps)
- **Heroku**: https://heroku.com (requires credit card)
