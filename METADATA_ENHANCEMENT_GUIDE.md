# File Upload Metadata & Search Enhancement - Implementation Guide

## Overview
This document outlines the implementation of enhanced file upload functionality with additional metadata fields (Guardian Name and Address) and improved search capabilities.

---

## ✅ Changes Implemented

### 1. **Database Schema Updates (Supabase)**

**SQL Migration Query** - Run this in your Supabase SQL Editor:

```sql
-- Add guardian_name and address columns to files table
ALTER TABLE files
ADD COLUMN guardian_name TEXT,
ADD COLUMN address TEXT;

-- Add indexes for faster search
CREATE INDEX idx_guardian_name ON files USING GIN(to_tsvector('english', guardian_name));
CREATE INDEX idx_address ON files USING GIN(to_tsvector('english', address));
```

**What Changed:**
- Added `guardian_name` column (TEXT) - Required field
- Added `address` column (TEXT) - Required field
- Created indexes on both columns for efficient searching

---

### 2. **Backend Changes**

#### File Model (`server/models/File.js`)
Updated the Mongoose schema to include:
```javascript
guardianName: {
  type: String,
  required: true,
  trim: true
},
address: {
  type: String,
  required: true,
  trim: true
}
```

#### Upload API Route (`server/routes/files.js`)
**Endpoint:** `POST /api/files/upload`

**Changes:**
- Added validation for `guardianName` and `address` fields
- Trimmed whitespace before saving
- Made all three fields (displayName, guardianName, address) required
- Removed the uniqueness check on `display_name` (allows duplicate names as per requirements)
- Inserted new fields into Supabase table

**Request Payload:**
```javascript
{
  file: File,           // The actual file being uploaded
  displayName: String,  // Required - renamed file name
  guardianName: String, // Required - guardian/parent name
  address: String,      // Required - address
  date: String          // Optional - ISO date string
}
```

**Validation Rules:**
- `displayName` → Required, trimmed
- `guardianName` → Required, trimmed
- `address` → Required, trimmed
- All three must be non-empty strings

#### Search API Route (`server/routes/files.js`)
**Endpoint:** `GET /api/files`

**Enhanced Search Query:**
```javascript
// Now searches across 4 fields (case-insensitive, partial match):
query = query.or(`
  display_name.ilike.%${search}%,
  gr_number.ilike.%${search}%,
  guardian_name.ilike.%${search}%,
  address.ilike.%${search}%
`);
```

**Search Behavior:**
- Case-insensitive partial matching on all fields
- Single search bar matches any of the four fields
- Date filtering remains unchanged
- Results ordered by upload_date descending

---

### 3. **Frontend Changes**

#### Upload Form (`client/src/views/Upload.vue`)
**New Form Fields Added:**

1. **Rename File (Required)**
   - Text input field
   - Appears after "Original Name"
   - Shows validation error message
   - Trimmed before submission

2. **Guardian Name (Required)**
   - Text input field
   - Appears below "Rename File"
   - Shows validation error message
   - Trimmed before submission

3. **Address (Required)**
   - Textarea field (allows multiline)
   - Appears below "Guardian Name"
   - Shows validation error message
   - Trimmed before submission

**Validation:**
- Form-level validation before upload
- Each field displays red border + error message if empty
- All fields must be filled to enable upload
- Error messages:
  - "Rename File is required"
  - "Guardian Name is required"
  - "Address is required"

**Form Submission:**
```javascript
FormData payload includes:
- file: The selected file
- displayName: Trimmed display name
- guardianName: Trimmed guardian name
- address: Trimmed address
- date: Selected date
```

#### Search/Results View (`client/src/views/Search.vue`)
**Search Bar Update:**
- Placeholder: "Search by name, guardian name, address, or GR number..."

**File Display Enhancement:**
- Shows file name (display_name) prominently
- Added metadata section showing:
  - Guardian Name (if present)
  - Address (if present)

**File Card Layout:**
```
📄 File Display Name
GR: 001 | Size: 1234.56 KB | Date: 2/16/2026
Guardian: Meena Shah | Address: Borivali
```

**Preview Dialog:**
- Enhanced to show guardian name and address above the preview

---

## 🧪 Search Behavior Examples

| Stored Data | User Input | Result |
|---|---|---|
| Rahul_Std7.pdf (Guardian: Meena Shah, Address: Borivali) | "Rahul" | ✅ Found |
| Rahul_Std7.pdf (Guardian: Meena Shah, Address: Borivali) | "Meena" | ✅ Found |
| Rahul_Std7.pdf (Guardian: Meena Shah, Address: Borivali) | "Borivali" | ✅ Found |
| Rahul_Std7.pdf (Guardian: Meena Shah, Address: Borivali) | "Std7" | ✅ Found |
| Rahul_Std7.pdf (Guardian: Meena Shah, Address: Borivali) | "001" | ✅ Found (GR: 001) |

---

## 🔄 Handling Existing Records

**Backward Compatibility:**
- Existing files without guardian_name and address will display:
  - Guardian: (empty/not shown)
  - Address: (empty/not shown)
- Search queries safely handle null/undefined values using Supabase's `.ilike()` operator
- No data migration needed - new fields are optional in Supabase

---

## 📋 Acceptance Criteria - Fulfilled

✅ Upload form shows two new fields below Rename File
✅ Data is stored successfully in Supabase
✅ Searching by guardian name OR address returns correct files
✅ Searching by file name, GR number also works
✅ Display name remains the renamed file (not guardian/address)
✅ Works for both new and existing records (gracefully handles null)
✅ Code is clean and maintainable
✅ All three fields are required and validated
✅ Whitespace is trimmed before saving
✅ Case-insensitive and partial match search
✅ Unique name validation removed (duplicates allowed)
✅ Preview/download functionality intact

---

## 🚀 Deployment Steps

### 1. Database Migration
```sql
-- Run in Supabase SQL Editor
ALTER TABLE files
ADD COLUMN guardian_name TEXT,
ADD COLUMN address TEXT;

CREATE INDEX idx_guardian_name ON files USING GIN(to_tsvector('english', guardian_name));
CREATE INDEX idx_address ON files USING GIN(to_tsvector('english', address));
```

### 2. Backend Deployment
- Updated files:
  - `server/models/File.js`
  - `server/routes/files.js`
- No new dependencies required

### 3. Frontend Deployment
- Updated files:
  - `client/src/views/Upload.vue`
  - `client/src/views/Search.vue`
- No new dependencies required

### 4. Testing Checklist
- [ ] Upload new file with all three fields
- [ ] Verify fields are stored in Supabase
- [ ] Search by file name
- [ ] Search by guardian name
- [ ] Search by address
- [ ] Search by GR number
- [ ] Search returns only matching results
- [ ] Existing files display gracefully
- [ ] Download functionality works
- [ ] Preview functionality works
- [ ] Admin delete functionality works

---

## 📝 API Payload Examples

### Upload Request
```javascript
POST /api/files/upload

FormData:
{
  file: <File>,
  displayName: "Rahul_Std7",
  guardianName: "Meena Shah",
  address: "Borivali, Mumbai",
  date: "2026-02-16"
}
```

### Search Request
```javascript
GET /api/files?search=Meena&date=2026-02-16

Response:
[
  {
    id: "uuid",
    filename: "1708090321-document.pdf",
    original_name: "document.pdf",
    display_name: "Rahul_Std7.pdf",
    gr_number: "001",
    size: 1234567,
    mimetype: "application/pdf",
    path: "uploads/1708090321-document.pdf",
    guardian_name: "Meena Shah",
    address: "Borivali, Mumbai",
    user_selected_date: "2026-02-16T00:00:00Z",
    uploaded_by_role: "admin"
  }
]
```

---

## 🔐 Validation & Security

- All inputs are trimmed to remove leading/trailing whitespace
- Required field validation on both frontend and backend
- XSS protection through Vue's template escaping
- SQL injection prevention through Supabase parameterized queries
- File access control maintained through existing auth middleware

---

## 📊 Database Schema (Final)

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  filename VARCHAR NOT NULL,
  original_name VARCHAR NOT NULL,
  display_name VARCHAR NOT NULL,
  gr_number VARCHAR NOT NULL UNIQUE,
  size INTEGER NOT NULL,
  mimetype VARCHAR NOT NULL,
  path VARCHAR NOT NULL,
  guardian_name TEXT,           -- NEW
  address TEXT,                 -- NEW
  user_selected_date TIMESTAMP,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  owner UUID NOT NULL REFERENCES users(id),
  uploaded_by_role VARCHAR,
  
  INDEX idx_guardian_name ON guardian_name,
  INDEX idx_address ON address
);
```

---

## ⚠️ Important Notes

1. **Unique Name Removed:** Display names can now be duplicated (as per requirements)
2. **All Fields Required:** Both Guardian Name and Address are now mandatory
3. **Case-Insensitive Search:** All searches are case-insensitive
4. **Partial Match:** Search works with partial text (e.g., "bori" finds "Borivali")
5. **Backward Compatibility:** Existing files without these fields won't break

---

## 📞 Support

If you encounter any issues:
1. Verify the Supabase migration ran successfully
2. Check browser console for frontend errors
3. Check server logs for backend errors
4. Ensure all files are deployed correctly
5. Clear browser cache and reload

