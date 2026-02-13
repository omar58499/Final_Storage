const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration - allow requests from Netlify frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.CLIENT_URL || ''
  ].filter(Boolean),
  credentials: true
};

app.use(cors(corsOptions));

// Initialize Supabase
const supabase = require('./config/supabase');

// Test Supabase connection
supabase.from('users').select('count()', { count: 'exact', head: true })
  .then(() => console.log('Supabase Connected Successfully'))
  .catch(err => console.error('Supabase Connection Error:', err));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    msg: 'File Manager API is running!',
    version: '1.0.0',
    database: 'Supabase (PostgreSQL)',
    status: '✅ Production Ready'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));

// Serve uploads statically (optional, but guarded by route usually)
// app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
