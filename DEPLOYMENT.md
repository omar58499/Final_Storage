# File Manager - Supabase Migration Guide

## Overview
This File Manager application has been migrated from MongoDB to **Supabase (PostgreSQL)** for better compatibility with Netlify serverless functions and improved reliability.

## What Changed

### Database Migration
- **Before**: MongoDB (Mongoose ODM)
- **After**: Supabase + PostgreSQL (SQL queries)

### Key Features
✅ User authentication with email/password
✅ File upload and storage
✅ File search by name and GR number
✅ File filtering by date
✅ JWT token-based authorization
✅ Secure password hashing with bcryptjs
✅ Works perfectly on Netlify

---

## Setup Instructions

### Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project (note your region)
4. Wait for the project to be provisioned

### Step 2: Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run these SQL queries:

```sql
-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Counters Table (for GR Number sequencing)
CREATE TABLE counters (
  id VARCHAR(50) PRIMARY KEY,
  seq INTEGER DEFAULT 0
);

-- Create Files Table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  gr_number VARCHAR(10) UNIQUE NOT NULL,
  size INTEGER NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  path VARCHAR(500) NOT NULL,
  user_selected_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  owner UUID NOT NULL,
  FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Indexes for Better Performance
CREATE INDEX idx_files_owner ON files(owner);
CREATE INDEX idx_files_display_name ON files(display_name);
CREATE INDEX idx_files_gr_number ON files(gr_number);
```

### Step 3: Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** (SUPABASE_URL)
3. Copy your **service_role key** (SUPABASE_SERVICE_KEY) - this is different from the anon key
4. Generate a **JWT_SECRET** (use a strong random string)

### Step 4: Configure Environment Variables

#### Local Development
Create a `.env` file in the `server` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
JWT_SECRET=your_very_secure_jwt_secret_here
PORT=5000
NODE_ENV=development
```

#### Production (Netlify)
1. Go to your Netlify site → **Site Settings** → **Build & Deploy** → **Environment**
2. Add the same environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Step 5: Install Dependencies

```bash
cd server
npm install
```

### Step 6: Run Locally

```bash
npm start
# Server runs on http://localhost:5000
```

### Step 7: Deploy to Netlify

1. Push your code to GitHub
2. Connect your repo to Netlify
3. Set the build command and publish directory based on your setup
4. Add environment variables in Netlify dashboard
5. Deploy!

---

## Database Schema

### Users Table
```
id (UUID) - Primary Key
email (VARCHAR) - Unique
password (VARCHAR) - Hashed
created_at (TIMESTAMP)
```

### Files Table
```
id (UUID) - Primary Key
filename (VARCHAR) - Server filename
original_name (VARCHAR) - Original uploaded name
display_name (VARCHAR) - User-friendly name
gr_number (VARCHAR) - Unique identifier
size (INTEGER) - File size in bytes
mimetype (VARCHAR) - File MIME type
path (VARCHAR) - Local file path
user_selected_date (TIMESTAMP)
upload_date (TIMESTAMP)
owner (UUID) - Foreign Key to users
```

### Counters Table
```
id (VARCHAR) - Primary Key
seq (INTEGER) - Counter value
```

---

## API Endpoints

### Authentication

**POST** `/api/auth/signup`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Files

**POST** `/api/files/upload` (Requires JWT token)
- Multipart form data with file and metadata

**GET** `/api/files` (Requires JWT token)
- Query params: `search`, `date`

**GET** `/api/files/:id` (Requires JWT token)

**GET** `/api/files/:id/content` (Requires JWT token)

**DELETE** `/api/files/:id` (Requires JWT token)

---

## Troubleshooting

### Issue: "Supabase Connection Error"
- Check SUPABASE_URL and SUPABASE_SERVICE_KEY
- Ensure environment variables are set correctly

### Issue: "Invalid Credentials" on Login
- Verify the user exists in the `users` table
- Check password hashing is working

### Issue: File Upload Fails
- Verify the `uploads/` directory exists
- Check file permissions
- Ensure `counters` table exists

### Issue: Search/Filter Not Working
- Make sure indexes are created
- Check that files are properly saved in database

---

## Differences from MongoDB

| Feature | MongoDB | Supabase |
|---------|---------|----------|
| Connection | Mongoose | @supabase/supabase-js |
| ID Type | ObjectId | UUID |
| Camelcase | Yes (displayName) | No (display_name - snake_case) |
| Query Style | Mongoose methods | SQL-like API |
| Deployment | Netlify (issues) | Netlify ✅ |

---

## Notes

- Column names use snake_case (display_name, original_name, etc.)
- All IDs are UUIDs instead of MongoDB ObjectIds
- GR numbers are automatically generated sequentially
- Files are stored in local `uploads/` directory
- User passwords are hashed with bcrypt

---

## Support

For issues with Supabase, visit [supabase.com/docs](https://supabase.com/docs)
For issues with this app, check the error logs in Netlify or locally.
