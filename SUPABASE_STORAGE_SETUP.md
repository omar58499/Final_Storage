# Supabase Storage Setup Guide

## Overview
This application now uses Supabase Storage for file uploads instead of storing files locally. This ensures files persist across cloud deployments and container restarts.

## Setup Steps

### 1. Create Storage Bucket in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **Create a new bucket**
4. Enter bucket name: `documents`
5. Set to **Public** (since we generate signed URLs for private access)
6. Click **Create bucket**

### 2. Update Database Schema

If you haven't already, add the `storage_url` column to the files table. Go to SQL Editor and run:

```sql
-- Add storage_url column to files table (if not exists)
ALTER TABLE files 
ADD COLUMN storage_url VARCHAR(1000);
```

### 3. Verify File Serving

After creating the bucket, the application will:
- **Upload files** to `documents/uploads/{gr_number}/{filename}`
- **Store signed URLs** in the `storage_url` column for public access
- **Serve files** by redirecting to the public/signed URL

### 4. File Retrieval Flow

When a user requests a file:
1. Server queries the file record from the database
2. If `storage_url` exists (new uploads), redirects to that public URL
3. Otherwise, creates a temporary signed URL with 1-hour expiry
4. Client receives the signed URL and can preview/download

### 5. Environment Variables

Make sure these are set in your deployment environment:

```
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_KEY=your_service_key
```

### 6. Bucket Permissions (Optional)

If you want to restrict direct access, you can update the bucket policies in Supabase Dashboard:

**Policies Tab** → Manage bucket policies to control who can read/write files.

For this application, public read access is fine since we use signed URLs with expiry times.

## Troubleshooting

### Files not showing up
- Check that the `documents` bucket exists in Supabase Storage
- Verify `SUPABASE_SERVICE_KEY` is set correctly (not the anon key)
- Check server logs for storage upload errors

### Upload fails with "bucket not found"
- Ensure the bucket name is exactly `documents` (case-sensitive)
- Create the bucket if it doesn't exist

### Preview/download returns 404
- Check that the file record has `path` or `storage_url` columns
- Verify the file actually exists in the Supabase Storage bucket
- Check for CORS issues between frontend and Supabase domains

## Free Tier Limits

Supabase free tier includes:
- **1 GB storage** (plenty for documents)
- **Up to 2 GB bandwidth** per month
- No file size limit per file, but respects bucket total

For larger deployments, upgrade to a paid plan.
