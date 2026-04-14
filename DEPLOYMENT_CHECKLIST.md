# 📋 Deployment Checklist - Print & Use

## Phase 1: Supabase Setup (Estimated: 15 minutes)

### Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Sign up with email
- [ ] Verify email address
- [ ] Create new organization

### Create Project
- [ ] Click "New Project"
- [ ] Choose a project name
- [ ] Set a secure database password (copy it!)
- [ ] Select region (choose closest to users)
- [ ] Click "Create new project"
- [ ] Wait 5-10 minutes for provisioning
- [ ] ✅ Project is ready (see dashboard)

### Database Setup
- [ ] Go to "SQL Editor" in left sidebar
- [ ] Click "New Query"
- [ ] Copy SQL from SUPABASE_SETUP.md
- [ ] Paste all queries into editor
- [ ] Click "Run" button
- [ ] ✅ Verify all 3 tables created (users, files, counters)
- [ ] ✅ Verify 3 indexes created

### Get Credentials
- [ ] Click "Project Settings" (bottom left gear)
- [ ] Go to "API" tab
- [ ] Copy **Project URL** and paste here:
  ```
  SUPABASE_URL = ________________________
  ```
- [ ] Find **service_role** key (NOT anon_key)
  ```
  SUPABASE_SERVICE_KEY = ________________________
  ```
- [ ] Generate JWT secret (use a strong random string):
  ```
  JWT_SECRET = ________________________
  ```

---

## Phase 2: Local Testing (Estimated: 20 minutes)

### Setup Environment
- [ ] Open terminal in `File_Manager/server` directory
- [ ] Create `.env` file (copy from `.env.example`)
- [ ] Paste Supabase credentials:
  ```
  SUPABASE_URL=<your_url>
  SUPABASE_SERVICE_KEY=<your_key>
  JWT_SECRET=<your_secret>
  PORT=5000
  NODE_ENV=development
  ```
- [ ] Save `.env` file
- [ ] ✅ Don't commit `.env` to Git!

### Install Dependencies
- [ ] Run: `npm install`
- [ ] Wait for completion
- [ ] ✅ No errors in output

### Start Server
- [ ] Run: `npm start`
- [ ] ✅ See: "Server started on port 5000"
- [ ] ✅ See: "Supabase Connected Successfully"

### Test Signup Endpoint
- [ ] Open another terminal
- [ ] Run:
  ```bash
  curl -X POST http://localhost:5000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"testpass123"}'
  ```
- [ ] ✅ Response includes a `token`
- [ ] ✅ Token is a long JWT string

### Test Login Endpoint
- [ ] Run:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"testpass123"}'
  ```
- [ ] ✅ Response includes a `token`

### Test File Operations
- [ ] Copy the token from login response
- [ ] Run upload test:
  ```bash
  curl -X POST http://localhost:5000/api/files/upload \
    -H "x-auth-token: YOUR_TOKEN_HERE" \
    -F "file=@testfile.txt" \
    -F "displayName=Test" \
    -F "date=2024-02-13"
  ```
- [ ] ✅ File uploads successfully

### Test File List
- [ ] Run:
  ```bash
  curl -X GET http://localhost:5000/api/files \
    -H "x-auth-token: YOUR_TOKEN_HERE"
  ```
- [ ] ✅ See list of files

---

## Phase 3: Prepare for Netlify (Estimated: 10 minutes)

### Code Push to GitHub
- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Migrate from MongoDB to Supabase"
  ```
- [ ] ✅ Ensure `.env` is NOT committed (check `.gitignore`)
- [ ] Push to GitHub:
  ```bash
  git push origin main
  ```
- [ ] ✅ All code is pushed

### Prepare Netlify Credentials
- [ ] Have these ready:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_SERVICE_KEY
  - [ ] JWT_SECRET
- [ ] Store in a secure location (password manager)
- [ ] ✅ Never share these publicly

---

## Phase 4: Deploy to Netlify (Estimated: 20 minutes)

### Connect GitHub to Netlify
- [ ] Go to netlify.com
- [ ] Sign up or log in
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Select GitHub as provider
- [ ] Authorize Netlify to access GitHub
- [ ] Select your repository
- [ ] ✅ Repository connected

### Configure Build Settings
- [ ] Base directory: `client` (if using Vue)
- [ ] Build command: `npm ci --include=dev && npm run build`
- [ ] Publish directory: `dist`
- [ ] ✅ Settings look correct

### Add Environment Variables
- [ ] Go to "Site Settings" → "Build & Deploy"
- [ ] Click "Environment" section
- [ ] Click "Edit variables"
- [ ] Add:
  ```
  SUPABASE_URL = <your_url>
  SUPABASE_SERVICE_KEY = <your_service_key>
  JWT_SECRET = <your_jwt_secret>
  NODE_ENV = production
  ```
- [ ] ✅ All 4 variables added

### Trigger Deploy
- [ ] Click "Deploy site"
- [ ] Watch build process
- [ ] ✅ Build completes successfully
- [ ] ✅ Site is live!

---

## Phase 5: Post-Deployment Testing (Estimated: 15 minutes)

### Test Production Endpoints
- [ ] Get your Netlify domain (e.g., `yoursite.netlify.app`)
- [ ] Test signup:
  ```bash
  curl -X POST https://yoursite.netlify.app/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"prod@example.com","password":"pass123"}'
  ```
- [ ] ✅ Get token back

### Test in Browser
- [ ] Open your Netlify domain in browser
- [ ] Try creating an account
- [ ] ✅ See success message
- [ ] Log in with new account
- [ ] ✅ See dashboard

### Test File Upload
- [ ] Click "Upload File" button
- [ ] Select a test file
- [ ] Add display name
- [ ] Click upload
- [ ] ✅ File appears in list

### Test Search/Filter
- [ ] Upload another file with different name
- [ ] Search for first file by name
- [ ] ✅ Correct file appears
- [ ] Filter by date
- [ ] ✅ Date filter works

### Test Delete
- [ ] Delete a test file
- [ ] ✅ File disappears from list
- [ ] Verify in Supabase dashboard
- [ ] ✅ File record deleted

---

## Phase 6: Verification (Final Check)

### Supabase Dashboard
- [ ] Go to supabase.com
- [ ] Open your project
- [ ] Go to "Table Editor"
- [ ] Check `users` table
  - [ ] ✅ See your test user(s)
- [ ] Check `files` table
  - [ ] ✅ See uploaded file(s)
- [ ] Check `counters` table
  - [ ] ✅ See GR number sequence updated

### Netlify Dashboard
- [ ] Go to netlify.com
- [ ] Go to your site
- [ ] Check "Deploys" tab
  - [ ] ✅ Latest deploy is successful (green)
- [ ] Check "Logs"
  - [ ] ✅ No error messages

### Error Monitoring
- [ ] Go to Netlify Functions logs
- [ ] ✅ No error messages
- [ ] Go to Supabase logs
- [ ] ✅ No database errors

---

## 🎉 Success Indicators

All these should be working:

- [ ] ✅ Can sign up with new email
- [ ] ✅ Can log in with email/password
- [ ] ✅ Get JWT token on login
- [ ] ✅ Can upload files
- [ ] ✅ Files appear in list
- [ ] ✅ Can search files
- [ ] ✅ Can filter by date
- [ ] ✅ Can download files
- [ ] ✅ Can delete files
- [ ] ✅ Each user sees only their files
- [ ] ✅ No CORS errors
- [ ] ✅ No database errors
- [ ] ✅ No timeout errors

---

## 🚨 If Something Fails

### "Connection Error" on Startup
- [ ] Check SUPABASE_URL is correct
- [ ] Check SUPABASE_SERVICE_KEY is correct
- [ ] Verify Supabase project is active
- [ ] Check internet connection

### "Invalid Credentials" on Login
- [ ] Verify user exists in database
- [ ] Check password is correct
- [ ] Verify password hashing worked

### "File Not Found" on Upload
- [ ] Check `uploads/` directory exists
- [ ] Check file permissions
- [ ] Verify disk has space

### "401 Unauthorized" on Protected Routes
- [ ] Check token is in header
- [ ] Check token hasn't expired
- [ ] Verify JWT_SECRET is correct

### Build Fails on Netlify
- [ ] Check environment variables are set
- [ ] Review build logs for errors
- [ ] Verify `.env` is not committed

---

## 📱 Quick Reference Cards

### Supabase Credentials Location
```
Project Settings → API
├── Project URL: SUPABASE_URL
├── anon_key: (don't use)
└── service_role: SUPABASE_SERVICE_KEY ✓
```

### Netlify Environment Variables
```
Site Settings → Build & Deploy → Environment
├── SUPABASE_URL
├── SUPABASE_SERVICE_KEY
├── JWT_SECRET
└── NODE_ENV=production
```

### Important Files
```
server/
├── .env (LOCAL ONLY - don't commit!)
├── package.json (updated)
├── server.js (updated)
├── config/
│   └── supabase.js (new)
└── routes/
    ├── auth.js (updated)
    └── files.js (updated)
```

---

## ⏱️ Time Estimates

| Phase | Time | Status |
|-------|------|--------|
| Phase 1: Supabase Setup | 15 min | |
| Phase 2: Local Testing | 20 min | |
| Phase 3: Prepare Netlify | 10 min | |
| Phase 4: Deploy | 20 min | |
| Phase 5: Test Production | 15 min | |
| Phase 6: Verify | 10 min | |
| **TOTAL** | **~90 min** | |

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **This Project Docs**: See INDEX.md

---

## ✅ Final Checklist

Before you declare victory:

- [ ] ✅ All phases completed
- [ ] ✅ All tests passing
- [ ] ✅ Production site working
- [ ] ✅ Credentials stored securely
- [ ] ✅ `.env` not in Git
- [ ] ✅ Documentation read
- [ ] ✅ Team notified of changes

---

**🎉 CONGRATULATIONS! Your app is now live on Netlify with Supabase!**

---

**Print this checklist and check off items as you go!**
**Save this page for future reference.**
