# Visual Changes & UI Reference

## Upload Form - Before vs After

### BEFORE (Original)
```
┌─────────────────────────────────┐
│         Upload File             │
├─────────────────────────────────┤
│  📄 Click to select a file      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Original Name                  │
│  document.pdf                   │
├─────────────────────────────────┤
│  Rename File (Optional)         │
│  ┌───────────────────────────┐  │
│  │ [renamed_file.pdf...]     │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  Select Date                    │
│  ┌───────────────────────────┐  │
│  │ [2026-02-16]              │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  [Upload]  [Cancel]             │
└─────────────────────────────────┘
```

### AFTER (Enhanced)
```
┌─────────────────────────────────┐
│         Upload File             │
├─────────────────────────────────┤
│  📄 Click to select a file      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Original Name                  │
│  document.pdf                   │
├─────────────────────────────────┤
│  Rename File *                  │
│  ┌───────────────────────────┐  │
│  │ [renamed_file.pdf...]     │  │
│  └───────────────────────────┘  │
│  ✗ Rename File is required (if  │
│    empty)                       │
├─────────────────────────────────┤
│  Guardian Name *        [NEW]   │
│  ┌───────────────────────────┐  │
│  │ [Meena Shah...]           │  │
│  └───────────────────────────┘  │
│  ✗ Guardian Name is required    │
│    (if empty)                   │
├─────────────────────────────────┤
│  Address *              [NEW]   │
│  ┌───────────────────────────┐  │
│  │ [Borivali, Mumbai...       │  │
│  │  ...]                     │  │
│  └───────────────────────────┘  │
│  ✗ Address is required (if      │
│    empty)                       │
├─────────────────────────────────┤
│  Select Date                    │
│  ┌───────────────────────────┐  │
│  │ [2026-02-16]              │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  [Upload]  [Cancel]             │
└─────────────────────────────────┘
```

---

## Search Results - Before vs After

### BEFORE (Original)
```
┌──────────────────────────────────────┐
│        Find Files                    │
├──────────────────────────────────────┤
│ [Search by name or GR number...    ] │
│                              [Search] │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 📄 Rahul_Std7.pdf                    │
│    GR: 001 | Size: 1234.56 KB        │
│    Date: 2/16/2026                   │
│                            [⬇️] [🗑️]  │
└──────────────────────────────────────┘
```

### AFTER (Enhanced)
```
┌──────────────────────────────────────┐
│        Find Files                    │
├──────────────────────────────────────┤
│ [Search by name, guardian name,    ] │
│  [address, or GR number...         ] │
│                              [Search] │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 📄 Rahul_Std7.pdf                    │
│    GR: 001 | Size: 1234.56 KB        │
│    Date: 2/16/2026                   │
│    Guardian: Meena Shah              │ [NEW]
│    Address: Borivali, Mumbai         │ [NEW]
│                            [⬇️] [🗑️]  │
└──────────────────────────────────────┘
```

---

## Search Functionality

### Search Capability Matrix

```
                 BEFORE    AFTER
File Name        ✅        ✅
GR Number        ✅        ✅
Guardian Name    ❌        ✅ [NEW]
Address          ❌        ✅ [NEW]
Date Filter      ✅        ✅
Case-Insensitive ✅        ✅
Partial Match    ✅        ✅
```

### Example Search Results

```
Database Contains:
┌─────────────────────────────────────────────┐
│ Name: Rahul_Std7.pdf                        │
│ GR: 001                                     │
│ Guardian: Meena Shah                        │
│ Address: Borivali, Mumbai                   │
└─────────────────────────────────────────────┘

Search Queries That Find This File:
✅ "Rahul"     (name match)
✅ "Std7"      (name match - partial)
✅ "001"       (GR number match)
✅ "Meena"     (guardian match)
✅ "Shah"      (guardian match - partial)
✅ "Borivali"  (address match)
✅ "Mumbai"    (address match - partial)
✅ "bor"       (address match - partial)
✅ "MEENA"     (case-insensitive guardian)
✅ "RAHUL"     (case-insensitive name)

Search Queries That DON'T Find This File:
❌ "Kumar"     (different guardian)
❌ "002"       (different GR)
❌ "Delhi"     (different address)
```

---

## Form Validation States

### Valid State
```
Rename File *
[████████████████]  ✓ (green border)

Guardian Name *
[████████████████]  ✓ (green border)

Address *
[████████████████]  ✓ (green border)

[Upload]  ✅ ENABLED
```

### Invalid State (Empty Fields)
```
Rename File *
[████████████████]  ✗ (red border)
✗ Rename File is required

Guardian Name *
[████████████████]  ✗ (red border)
✗ Guardian Name is required

Address *
[████████████████]  ✗ (red border)
✗ Address is required

[Upload]  ❌ DISABLED
```

---

## Database Schema Updates

### Files Table - New Columns

```sql
Column Added          Type    Required  Notes
──────────────────────────────────────────────
guardian_name         TEXT    YES       Trimmed
address               TEXT    YES       Trimmed

Indexes Added:
idx_guardian_name - for fast searching
idx_address       - for fast searching
```

### Example Record

```
OLD RECORD (Before):
{
  id: "uuid",
  filename: "1708090321-doc.pdf",
  display_name: "Rahul_Std7.pdf",
  gr_number: "001",
  size: 1234567,
  user_selected_date: "2026-02-16",
  upload_date: "2026-02-16",
  owner: "user_id"
}

NEW RECORD (After):
{
  id: "uuid",
  filename: "1708090321-doc.pdf",
  display_name: "Rahul_Std7.pdf",
  gr_number: "001",
  size: 1234567,
  user_selected_date: "2026-02-16",
  upload_date: "2026-02-16",
  owner: "user_id",
  guardian_name: "Meena Shah",        ← NEW
  address: "Borivali, Mumbai"         ← NEW
}
```

---

## File Card Evolution

### OLD FILE CARD
```
┌────────────────────────────────────┐
│ 📄 Rahul_Std7.pdf                  │
│    GR: 001 | Size: 1234.56 KB      │
│    Date: 2/16/2026                 │
│                        [⬇️] [🗑️]    │
└────────────────────────────────────┘
```

### NEW FILE CARD
```
┌────────────────────────────────────┐
│ 📄 Rahul_Std7.pdf                  │
│    GR: 001 | Size: 1234.56 KB      │
│    Date: 2/16/2026                 │
│    Guardian: Meena Shah        [NEW]
│    Address: Borivali, Mumbai   [NEW]
│                        [⬇️] [🗑️]    │
└────────────────────────────────────┘
```

---

## API Changes

### Upload Endpoint

**OLD REQUEST:**
```javascript
POST /api/files/upload
FormData {
  file: File,
  displayName: "Rahul_Std7",
  date: "2026-02-16"
}
```

**NEW REQUEST:**
```javascript
POST /api/files/upload
FormData {
  file: File,
  displayName: "Rahul_Std7",
  guardianName: "Meena Shah",    ← NEW (required)
  address: "Borivali, Mumbai",   ← NEW (required)
  date: "2026-02-16"
}
```

### Search Endpoint

**OLD SEARCH:**
```javascript
GET /api/files?search=Rahul
// Searches: display_name, gr_number
```

**NEW SEARCH:**
```javascript
GET /api/files?search=Rahul
// Searches: display_name, gr_number, 
//           guardian_name, address
```

---

## Responsive Design

### Mobile View (Upload)
```
┌───────────────┐
│ ← Back        │
├───────────────┤
│ Upload File   │
├───────────────┤
│ 📄 Select     │
├───────────────┤
│ Original:     │
│ doc.pdf       │
├───────────────┤
│ Rename File * │
│ [___________] │
├───────────────┤
│ Guardian *    │
│ [___________] │
├───────────────┤
│ Address *     │
│ [_________    │
│  _________]   │
├───────────────┤
│ Date          │
│ [___________] │
├───────────────┤
│ [Upload]      │
│ [Cancel]      │
└───────────────┘
```

### Mobile View (Search Results)
```
┌───────────────┐
│ ← Back        │
├───────────────┤
│ Find Files    │
├───────────────┤
│ [Search...]   │
│ [Search]      │
├───────────────┤
│ 📄 File       │
│ GR: 001       │
│ Size: 1234 KB │
│ Date: 2/16    │
│ Guardian:...  │
│ Address:...   │
│ [⬇️] [🗑️]     │
└───────────────┘
```

---

## Color Coding

### Valid/Required Indicators
```
* = Red asterisk (required field)
✓ = Green checkmark (valid)
✗ = Red X (error)

Valid field:     green border
Invalid field:   red border
Error message:   red text
Success message: green text
```

---

## Backward Compatibility

### Existing Files Display
```
OLD FILE (No guardian/address):
┌────────────────────────────────────┐
│ 📄 Old_File.pdf                    │
│    GR: 001 | Size: 1234.56 KB      │
│    Date: 2/16/2026                 │
│    (no guardian/address shown)      │
│                        [⬇️] [🗑️]    │
└────────────────────────────────────┘

NEW FILE (With guardian/address):
┌────────────────────────────────────┐
│ 📄 New_File.pdf                    │
│    GR: 002 | Size: 5678.90 KB      │
│    Date: 2/16/2026                 │
│    Guardian: Meena Shah             │
│    Address: Borivali, Mumbai        │
│                        [⬇️] [🗑️]    │
└────────────────────────────────────┘
```

---

## State Transitions

### Upload Flow
```
START
  ↓
[File Selected]
  ↓
[Form Visible]
  ├─ All Fields Empty → Validation Errors Shown
  ├─ Some Fields Filled → Partial Errors Shown
  └─ All Fields Filled → Upload Enabled
  ↓
[Upload Clicked]
  ↓
[Validation Check]
  ├─ FAILED → Error Message + Red Borders
  └─ PASSED → Submitting...
  ↓
[Server Response]
  ├─ SUCCESS → Success Message → Form Reset
  └─ ERROR → Error Message + Details
  ↓
END
```

### Search Flow
```
START
  ↓
[User Types Query]
  ↓
[Enter/Click Search]
  ↓
[Backend Searches]
  ↓
[Results Returned]
  ├─ Found Files → Display with Metadata
  ├─ No Files → "No files found" message
  └─ Error → Error message
  ↓
[User Can Click File]
  └─ Preview Opens
  ↓
END
```

---

## Summary of Changes

| Component | Change Type | Old Value | New Value | Impact |
|-----------|------------|-----------|-----------|--------|
| Upload Form | Add Field | 2 fields | 3 fields | UX Enhancement |
| Upload Form | Validation | Optional rename | Required all 3 | Data Quality |
| Upload API | Accept Field | 2 fields | 4 fields | Data Capture |
| Upload API | Validation | 1 validation | 3 validations | Data Quality |
| Search API | Search Fields | 2 fields | 4 fields | Discoverability |
| Search Results | Display | Basic info | + Metadata | UX Enhancement |
| Database | Schema | 12 columns | 14 columns | Storage |
| Database | Indexes | 2 indexes | 4 indexes | Performance |

---

**Implementation Date:** February 16, 2026
**Status:** COMPLETE ✅

