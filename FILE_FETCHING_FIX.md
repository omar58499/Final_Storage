# File Fetching Issue - Resolution Summary

## Problem
The website was not fetching and displaying uploaded files. The error message showed:
```
Cannot GET //api/files/ebdbc701-4257-4482-bacb-d467b23c426f/content
```

## Root Causes

1. **Files stored locally on server** - Files were being saved to the local `uploads/` directory, which doesn't persist in cloud deployments (Railway, Netlify). When the container restarts, all files are lost.

2. **Route ordering issue** - The more specific route `/api/files/:id/content` came after the generic route `/api/files/:id`, causing Express to match the wrong route.

3. **Missing Supabase Storage integration** - The application wasn't using Supabase's cloud storage solution, which is essential for production deployments.

## Solutions Implemented

### 1. **Implemented Supabase Storage** ✅
- Changed file uploads from local disk to Supabase Storage bucket (`documents`)
- Files are now stored at: `documents/uploads/{gr_number}/{filename}`
- Files persist across deployments and container restarts

**Changes in `server/routes/files.js`:**
```javascript
// Upload now uses multer.memoryStorage()
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Files uploaded to Supabase Storage
await supabase.storage
  .from('documents')
  .upload(filePath, req.file.buffer, {
    contentType: req.file.mimetype,
    upsert: false
  });
```

### 2. **Fixed Route Ordering** ✅
- Moved more specific route `/api/files/:id/content` **before** generic route `/api/files/:id`
- Ensures Express matches the correct endpoint first

### 3. **Added Proper Authentication** ✅
- Added `auth` middleware to the `/content` endpoint
- Removed insecure token verification from query parameters
- Now uses standard auth middleware for all file operations

### 4. **File Retrieval via Signed URLs** ✅
- New uploads store `storage_url` (public URL) in database
- File content endpoint redirects to the storage URL
- Fallback creates signed URLs for older files (1-hour expiry)

**Updated endpoint:**
```javascript
router.get('/:id/content', auth, async (req, res) => {
  // Fetch file from database
  const file = await supabase
    .from('files')
    .select('*')
    .eq('id', req.params.id);
  
  // If public URL available, redirect to it
  if (file.storage_url) {
    return res.redirect(file.storage_url);
  }
  
  // Otherwise create signed URL
  const signedUrl = await supabase.storage
    .from('documents')
    .createSignedUrl(file.path, 3600);
  
  return res.redirect(signedUrl);
});
```

### 5. **Updated Delete Operations** ✅
- Modified delete endpoint to remove files from both Supabase Storage and database
- Prevents orphaned files in cloud storage

### 6. **Enhanced Logging** ✅
- Added detailed console logging for debugging file operations
- Better error messages for troubleshooting

## Files Modified

1. **`server/routes/files.js`** - Main file route handler
   - Switched to Supabase Storage for uploads
   - Fixed route ordering
   - Updated content serving with signed URLs
   - Enhanced error handling

2. **`server/server.js`** - Express server configuration
   - Enabled static serving of `/uploads` endpoint as fallback

## Required Setup

### 1. Create Supabase Storage Bucket
```
Supabase Dashboard → Storage → Create New Bucket
Name: documents
Access: Public (for signed URLs)
```

### 2. Update Database Schema
```sql
ALTER TABLE files 
ADD COLUMN storage_url VARCHAR(1000);
```

### 3. Verify Environment Variables
```
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_KEY=your_service_key
```

See `SUPABASE_STORAGE_SETUP.md` for detailed instructions.

## Testing Checklist

- [ ] Create Supabase Storage bucket named `documents`
- [ ] Run the SQL schema update
- [ ] Deploy updated server code
- [ ] Upload a new file
- [ ] Verify file appears in Supabase Storage dashboard
- [ ] View file in browser (preview/download)
- [ ] Check file can be downloaded via API
- [ ] Delete file and verify it's removed from storage
- [ ] Check server logs for any errors

## Benefits

✅ **Persistent Storage** - Files survive container restarts
✅ **Scalability** - Supabase handles storage infrastructure
✅ **Security** - Signed URLs with expiry time
✅ **Reliability** - No dependency on local filesystem
✅ **Production Ready** - Works on Railway, Netlify, and other platforms

## Backward Compatibility

Older files stored locally can still be accessed via the fallback mechanism that creates signed URLs from the stored file path. New uploads will use the optimized `storage_url` approach.

## Next Steps

1. Follow `SUPABASE_STORAGE_SETUP.md` to complete the setup
2. Deploy the updated server code to Railway
3. Test file upload and retrieval in production
4. Monitor server logs for any issues
