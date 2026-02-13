# API Reference Guide

## Base URL
```
Local: http://localhost:5000
Production: Your Netlify domain/api
```

## Authentication
All protected endpoints require the `x-auth-token` header:
```
x-auth-token: {JWT_TOKEN}
```

---

## Authentication Endpoints

### 1. Signup - Create New Account
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400`: User already exists
- `500`: Server error

---

### 2. Login - Authenticate User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400`: Invalid credentials (user not found or wrong password)
- `500`: Server error

---

## File Endpoints

### 3. Upload File
```http
POST /api/files/upload
Content-Type: multipart/form-data
x-auth-token: {JWT_TOKEN}

Form Data:
- file: <file_input>
- displayName: "My Report"
- date: "2024-02-13"
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "1707831422000-report.pdf",
  "original_name": "report.pdf",
  "display_name": "My Report",
  "gr_number": "001",
  "size": 256000,
  "mimetype": "application/pdf",
  "path": "uploads/1707831422000-report.pdf",
  "user_selected_date": "2024-02-13T00:00:00Z",
  "upload_date": "2024-02-13T10:30:22Z",
  "owner": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Errors:**
- `400`: No file uploaded
- `401`: Unauthorized (no token)
- `500`: Server error

---

### 4. Get All Files (with filters)
```http
GET /api/files?search=report&date=2024-02-13
x-auth-token: {JWT_TOKEN}
```

**Query Parameters:**
- `search` (optional): Search by display name or GR number
- `date` (optional): Filter by date (format: YYYY-MM-DD)

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "1707831422000-report.pdf",
    "original_name": "report.pdf",
    "display_name": "My Report",
    "gr_number": "001",
    "size": 256000,
    "mimetype": "application/pdf",
    "path": "uploads/1707831422000-report.pdf",
    "user_selected_date": "2024-02-13T00:00:00Z",
    "upload_date": "2024-02-13T10:30:22Z",
    "owner": "550e8400-e29b-41d4-a716-446655440001"
  }
]
```

---

### 5. Get File Details
```http
GET /api/files/{file_id}
x-auth-token: {JWT_TOKEN}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "1707831422000-report.pdf",
  "original_name": "report.pdf",
  "display_name": "My Report",
  "gr_number": "001",
  "size": 256000,
  "mimetype": "application/pdf",
  "path": "uploads/1707831422000-report.pdf",
  "user_selected_date": "2024-02-13T00:00:00Z",
  "upload_date": "2024-02-13T10:30:22Z",
  "owner": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Errors:**
- `404`: File not found
- `401`: Not authorized (file doesn't belong to user)

---

### 6. Download/Preview File
```http
GET /api/files/{file_id}/content
x-auth-token: {JWT_TOKEN}
```

**Alternative:** Pass token as query parameter:
```
GET /api/files/{file_id}/content?token={JWT_TOKEN}
```

**Response:**
- Binary file content with appropriate Content-Type header

**Errors:**
- `401`: No token or invalid token
- `404`: File not found on server
- `401`: Not authorized

---

### 7. Delete File
```http
DELETE /api/files/{file_id}
x-auth-token: {JWT_TOKEN}
```

**Response (200 OK):**
```json
{
  "msg": "File removed"
}
```

**Errors:**
- `404`: File not found
- `401`: Not authorized (file doesn't belong to user)
- `500`: Server error

---

## Request Examples

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Upload File:**
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "x-auth-token: YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "displayName=My Document" \
  -F "date=2024-02-13"
```

**Get Files:**
```bash
curl -X GET "http://localhost:5000/api/files?search=report" \
  -H "x-auth-token: YOUR_TOKEN"
```

**Delete File:**
```bash
curl -X DELETE http://localhost:5000/api/files/FILE_ID \
  -H "x-auth-token: YOUR_TOKEN"
```

---

## Using JavaScript/Fetch API

```javascript
// Signup
const signupRes = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
});
const { token } = await signupRes.json();

// Upload File
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('displayName', 'My File');
formData.append('date', '2024-02-13');

const uploadRes = await fetch('/api/files/upload', {
  method: 'POST',
  headers: { 'x-auth-token': token },
  body: formData
});

// Get Files
const filesRes = await fetch('/api/files?search=report', {
  headers: { 'x-auth-token': token }
});
const files = await filesRes.json();
```

---

## Error Responses

All errors follow this format:
```json
{
  "msg": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- File IDs and User IDs are UUIDs
- GR Numbers are automatically generated (001, 002, 003, etc.)
- Tokens expire after 360000 seconds (100 hours)
- All user file queries are automatically filtered by owner
- Passwords are hashed with bcryptjs and never returned in responses
