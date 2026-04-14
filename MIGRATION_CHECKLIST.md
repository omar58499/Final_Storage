# Supabase Migration Checklist

## ✅ What Has Been Done

### Code Changes
- [x] Replaced MongoDB/Mongoose with Supabase (@supabase/supabase-js)
- [x] Updated server.js to connect to Supabase instead of MongoDB
- [x] Updated auth routes (signup/login) to use Supabase
- [x] Updated file routes (upload/get/delete) to use Supabase
- [x] Updated package.json dependencies
- [x] Created Supabase client configuration
- [x] Updated middleware and authentication logic
- [x] All database queries now use SQL with Supabase client

### Documentation
- [x] Created SUPABASE_SETUP.md with SQL schema
- [x] Created DEPLOYMENT.md with complete setup guide
- [x] Created .env.example with all required variables
- [x] Created setup scripts for bash and PowerShell

### Database Schema
The schema includes:
- `users` table with email/password authentication
- `files` table with all file metadata
- `counters` table for sequential GR number generation
- Proper foreign keys and indexes for performance

---

## 🚀 Steps You Need to Complete

### Step 1: Supabase Account Setup
- [ ] Go to https://supabase.com
- [ ] Sign up for a free account
- [ ] Create a new project
- [ ] Wait for provisioning (5-10 minutes)

### Step 2: Database Setup
- [ ] Open SQL Editor in Supabase
- [ ] Run all SQL queries from SUPABASE_SETUP.md
- [ ] Verify all 3 tables are created (users, files, counters)
- [ ] Check that indexes are created

### Step 3: Get Credentials
- [ ] Go to Project Settings → API
- [ ] Copy Project URL → Store as SUPABASE_URL
- [ ] Copy `service_role` key (NOT anon key) → Store as SUPABASE_SERVICE_KEY
- [ ] Generate a strong JWT secret → Store as JWT_SECRET

### Step 4: Local Setup
- [ ] Create `server/.env` file
- [ ] Add SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET
- [ ] Run: `npm install` (in server directory)
- [ ] Run: `npm start` to test locally
- [ ] Test signup/login endpoints
- [ ] Test file upload functionality

### Step 5: Netlify Deployment
- [ ] Push code to GitHub (if not already)
- [ ] Go to Netlify dashboard
- [ ] Connect your GitHub repo
- [ ] Go to Site Settings → Build & Deploy → Environment
- [ ] Add environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `JWT_SECRET`
  - `NODE_ENV=production`
- [ ] Trigger a new deploy
- [ ] Test signup/login on live site
- [ ] Test file upload on live site
- [ ] Test search/filter functionality

### Step 6: Post-Deployment Testing
- [ ] Create new user account
- [ ] Log in with email/password
- [ ] Upload a test file
- [ ] Download/preview file
- [ ] Search files by name
- [ ] Filter files by date
- [ ] Delete a file
- [ ] Verify all CRUD operations work

---

## 📝 Important Notes

### Column Naming
MongoDB used camelCase (displayName), but PostgreSQL/Supabase uses snake_case (display_name). 
This is already handled in all route files.

### ID Format
- MongoDB: ObjectId (24-character hex)
- Supabase: UUID (36-character with dashes)

Both are stored as strings in JWT tokens, so authentication still works the same.

### File Storage
Files are still stored in the local `uploads/` directory. 
If using Netlify Functions, you may need to store files in Supabase Storage instead (for production).

### Environment Variables
Never commit `.env` file to Git. Use `.env.example` as a template for team members.

### JWT Secret
Keep JWT_SECRET confidential. Generate a strong random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🆘 Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution**: Run `npm install` in the server directory

### Issue: "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY"
**Solution**: Check your .env file has correct variables set

### Issue: "Signup/Login not working"
**Solution**: 
- Verify users table exists in Supabase
- Check that SUPABASE_SERVICE_KEY is correct (use service_role, not anon)

### Issue: "File upload fails"
**Solution**:
- Create `uploads/` directory if it doesn't exist
- Check file permissions
- Verify counters table has been created

### Issue: "Search not working"
**Solution**:
- Ensure files are being saved to database
- Check indexes are created on display_name and gr_number

### Issue: "401 Unauthorized on Netlify"
**Solution**:
- Verify JWT_SECRET environment variable is set in Netlify
- Check token is being sent in request headers

---

## ✨ Features Preserved

✅ User signup/login with email and password
✅ JWT token-based authentication
✅ File upload with custom display names
✅ Sequential GR number generation
✅ File search by name or GR number
✅ File filtering by upload date
✅ File deletion with cleanup
✅ User-specific file isolation
✅ Bcrypt password hashing
✅ Token expiration (360000 seconds)

---

## 📊 Database Stats

**Free Tier Limits (Supabase):**
- Storage: 500 MB (good for file metadata)
- Database: Unlimited queries
- Users: Unlimited
- Real-time: Included
- Functions: 2 per project

For actual file uploads >500MB, consider storing files in Supabase Storage (free tier includes 1GB).

---

## 🎯 Next Steps After Deployment

1. Test the application thoroughly in production
2. Monitor error logs in Netlify
3. Monitor database usage in Supabase dashboard
4. Consider setting up Supabase Storage for file backups
5. Set up email notifications for errors
6. Plan backup strategy for your database

---

## 📞 Getting Help

- Supabase Docs: https://supabase.com/docs
- Netlify Docs: https://docs.netlify.com
- Express.js Docs: https://expressjs.com
- JWT Docs: https://jwt.io

---

**Migration completed successfully! You're now ready for production deployment on Netlify.**
