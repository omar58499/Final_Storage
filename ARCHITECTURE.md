# Architecture Overview

## Application Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Vue.js)                        │
│                   (Hosted on Netlify)                       │
│                                                             │
│  ├── Login/Signup Pages                                    │
│  ├── Dashboard (File List)                                 │
│  ├── Upload Page                                           │
│  └── Search/Filter                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
                   (HTTP/REST API Calls)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Express.js)                   │
│                   (Hosted on Netlify)                       │
│                                                             │
│  Routes:                                                    │
│  ├── POST   /api/auth/signup      (Create user)           │
│  ├── POST   /api/auth/login       (Authenticate)          │
│  ├── POST   /api/files/upload     (Upload file)           │
│  ├── GET    /api/files            (List user's files)     │
│  ├── GET    /api/files/:id        (Get file info)         │
│  ├── GET    /api/files/:id/content (Download file)        │
│  └── DELETE /api/files/:id        (Delete file)           │
│                                                             │
│  Middleware:                                                │
│  └── JWT Authentication (auth.js)                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
                 (SQL Queries via Supabase Client)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL Database)                 │
│              (Free tier, cloud-hosted)                      │
│                                                             │
│  Tables:                                                    │
│  ├── users          (Email, Password, Created Date)        │
│  ├── files          (File metadata, ownership)             │
│  └── counters       (GR Number sequence)                   │
│                                                             │
│  Indexes:                                                   │
│  ├── files.owner                                           │
│  ├── files.display_name                                    │
│  └── files.gr_number                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
                 (Local file system storage)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              uploads/ Directory                             │
│         (Stores actual file data on server)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

### User Signup/Login Flow
```
User Input (Email, Password)
           ↓
   Client sends POST request
           ↓
   Server receives request → No JWT required for /auth
           ↓
   Check if user exists (Supabase)
           ↓
   Hash password (bcryptjs)
           ↓
   Save to users table (Supabase)
           ↓
   Generate JWT token
           ↓
   Return token to client
           ↓
   Client stores token (localStorage)
```

### File Upload Flow
```
User selects file + display name
           ↓
   Client sends multipart request with JWT token
           ↓
   Server validates JWT token (middleware)
           ↓
   Multer saves file to uploads/ directory
           ↓
   Get next GR number from counters table
           ↓
   Save file metadata to files table (Supabase)
           ↓
   Return file object to client
           ↓
   Client displays success message
```

### File Search/Filter Flow
```
User searches or filters
           ↓
   Client sends GET request with query params + JWT
           ↓
   Server validates JWT token
           ↓
   Build SQL query:
     - Filter by owner (user ID)
     - Filter by search term (ILIKE)
     - Filter by date range (if provided)
           ↓
   Execute query on Supabase
           ↓
   Return matching files to client
           ↓
   Client displays results
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User Login Process                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Client: POST /api/auth/login                           │
│     { email: "user@example.com", password: "..." }        │
│                                                             │
│  2. Server: Query users table for email                    │
│     SELECT * FROM users WHERE email = ?                   │
│                                                             │
│  3. Server: Compare password with hashed password          │
│     bcrypt.compare(inputPassword, storedHash)             │
│                                                             │
│  4. Server: Generate JWT token                             │
│     jwt.sign({ user: { id: userId } }, SECRET)           │
│                                                             │
│  5. Server: Return token to client                         │
│     { token: "eyJhbGc..." }                               │
│                                                             │
│  6. Client: Store token (localStorage)                     │
│     localStorage.setItem('token', token)                  │
│                                                             │
│  7. Client: Include token in all API requests              │
│     Headers: { 'x-auth-token': token }                    │
│                                                             │
│  8. Server: Verify token on protected routes               │
│     jwt.verify(token, SECRET)                             │
│                                                             │
│  9. Server: Extract user ID from decoded token             │
│     req.user.id = decoded.user.id                         │
│                                                             │
│ 10. Server: Use user ID for authorization checks           │
│     WHERE owner = req.user.id                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```
┌──────────────────────────┐
│        users             │
├──────────────────────────┤
│ id (UUID) ⭐             │
│ email (VARCHAR) UNIQUE   │
│ password (VARCHAR)       │
│ created_at (TIMESTAMP)   │
└──────────────────────────┘
           ↑
           │ (owner_id)
           │ (foreign key)
           │
┌──────────────────────────────────────┐
│          files                        │
├──────────────────────────────────────┤
│ id (UUID) ⭐                          │
│ filename (VARCHAR)                   │
│ original_name (VARCHAR)              │
│ display_name (VARCHAR)               │
│ gr_number (VARCHAR) UNIQUE           │
│ size (INTEGER)                       │
│ mimetype (VARCHAR)                   │
│ path (VARCHAR)                       │
│ user_selected_date (TIMESTAMP)       │
│ upload_date (TIMESTAMP)              │
│ owner (UUID) 🔗                      │
└──────────────────────────────────────┘

┌──────────────────────────┐
│      counters            │
├──────────────────────────┤
│ id (VARCHAR) ⭐          │
│ seq (INTEGER)            │
└──────────────────────────┘

Legend:
⭐ = Primary Key
🔗 = Foreign Key
```

---

## Security Architecture

```
┌──────────────────────────────────────────┐
│      Request Arrives                     │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  1. CORS Check                           │
│     - Validate origin                    │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  2. Authentication Routes (/auth)        │
│     - No JWT required                    │
│     - Bcrypt password hashing            │
│     - Return JWT token                   │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  3. JWT Middleware (Protected Routes)    │
│     - Extract token from header          │
│     - Verify token signature             │
│     - Decode user ID                     │
│     - Pass to next middleware            │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  4. Authorization Checks                 │
│     - Verify user owns resource          │
│     - WHERE owner = req.user.id          │
│     - Return 401 if mismatch             │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  5. Database Query                       │
│     - Execute SQL with user context      │
│     - Return only user's data            │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  Response Sent to Client                 │
└──────────────────────────────────────────┘
```

---

## Deployment Architecture

```
GitHub Repository
       ↓
  (git push)
       ↓
┌──────────────────────────┐
│   Netlify CI/CD          │
│                          │
│ 1. Build Frontend        │
│    npm run build         │
│                          │
│ 2. Deploy to CDN         │
│    Global distribution   │
│                          │
│ 3. Deploy Backend        │
│    (Functions)           │
│                          │
│ 4. Set Env Variables     │
│    From dashboard        │
└──────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│  Live Production Environment             │
│                                          │
│  Frontend: https://your-domain.netlify   │
│  API: https://your-domain/.netlify/      │
│                                          │
│  Connected to:                           │
│  - Supabase (Database)                   │
│  - File Storage (uploads/)               │
└──────────────────────────────────────────┘
```

---

## Data Flow Summary

```
CLIENT LAYER (Vue.js + Browser)
    ↓
    ├─ User Input (email, password, files)
    ├─ HTTP Requests (with JWT headers)
    └─ Display Results (files list, status)
    
    ↓↓↓
    
API LAYER (Express.js on Netlify)
    ↓
    ├─ Route Handlers (/auth, /files)
    ├─ JWT Verification (middleware)
    ├─ Business Logic (validation, processing)
    └─ Database Operations (via Supabase)
    
    ↓↓↓
    
DATA LAYER (Supabase PostgreSQL)
    ↓
    ├─ Users Table (authentication)
    ├─ Files Table (metadata)
    ├─ Counters Table (sequences)
    └─ SQL Indexes (performance)
    
    ↓↓↓
    
STORAGE LAYER (Local + Cloud)
    ↓
    ├─ Local: uploads/ directory
    ├─ Metadata: Supabase database
    └─ Both kept in sync
```

---

## Benefits of Current Architecture

✅ **Scalable** - Supabase handles unlimited users and queries
✅ **Secure** - JWT tokens, password hashing, user isolation
✅ **Reliable** - Enterprise-grade PostgreSQL database
✅ **Fast** - Indexed database queries, CDN delivery
✅ **Maintainable** - Clear separation of concerns
✅ **Free** - Netlify free tier + Supabase free tier
✅ **Production-Ready** - Works on Netlify without issues
✅ **Developer Friendly** - Simple REST API, good documentation
