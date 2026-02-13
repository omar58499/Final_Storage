# Supabase Migration Guide

## Step 1: Create Supabase Project
1. Go to https://supabase.com and sign up (free)
2. Create a new project
3. Note your project URL and anon/service key

## Step 2: Create Tables in Supabase
Go to SQL Editor in Supabase dashboard and run these SQL queries:

### Create Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Create Counters Table
```sql
CREATE TABLE counters (
  id VARCHAR(50) PRIMARY KEY,
  seq INTEGER DEFAULT 0
);
```

### Create Files Table
```sql
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

CREATE INDEX idx_files_owner ON files(owner);
CREATE INDEX idx_files_display_name ON files(display_name);
CREATE INDEX idx_files_gr_number ON files(gr_number);
```

## Step 3: Set Environment Variables
Add to your .env file:
```
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_service_key_here
JWT_SECRET=your_jwt_secret_here
```

## Step 4: Install Dependencies
```bash
npm install @supabase/supabase-js
```

The migration is complete! Your app now works with Supabase (PostgreSQL) instead of MongoDB.
