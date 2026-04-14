const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Save with unique name to prevent overwrite
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  preservePath: true
});

function normalizeSelectedDate(dateValue) {
  if (!dateValue || typeof dateValue !== 'string') {
    return new Date().toISOString();
  }

  const trimmed = dateValue.trim();
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  if (isDateOnly) {
    return `${trimmed}T00:00:00.000Z`;
  }

  const parsedDate = new Date(trimmed);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
}

// Helper function to increment counter
async function getNextGrNumber() {
  const { data: counter, error } = await supabase
    .from('counters')
    .select('seq')
    .eq('id', 'grNumber')
    .single();

  let currentSeq = counter?.seq;

  if (error || currentSeq == null) {
    const { data: latestFile } = await supabase
      .from('files')
      .select('gr_number')
      .order('upload_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const parsed = Number.parseInt(latestFile?.gr_number || '0', 10);
    currentSeq = Number.isFinite(parsed) ? parsed : 0;
  }

  const newSeq = currentSeq + 1;

  await supabase
    .from('counters')
    .upsert({ id: 'grNumber', seq: newSeq }, { onConflict: 'id' });

  return String(newSeq).padStart(3, '0');
}

// @route   POST api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('\n===== UPLOAD REQUEST =====');
    console.log('User:', req.user);
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ msg: 'No file was uploaded' });
    }
    
    console.log('File received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    console.log('req.body type:', typeof req.body);
    console.log('req.body keys:', Object.keys(req.body || {}));
    console.log('Full req.body:', JSON.stringify(req.body, null, 2));
    
    // Log each field individually
    console.log('Field extraction:');
    console.log('  displayName:', req.body?.displayName, `(type: ${typeof req.body?.displayName})`);
    console.log('  personName:', req.body?.personName, `(type: ${typeof req.body?.personName})`);
    console.log('  guardianName:', req.body?.guardianName, `(type: ${typeof req.body?.guardianName})`);
    console.log('  propertyNumber:', req.body?.propertyNumber, `(type: ${typeof req.body?.propertyNumber})`);
    console.log('  address:', req.body?.address, `(type: ${typeof req.body?.address})`);
    console.log('  date:', req.body?.date, `(type: ${typeof req.body?.date})`);
    
    if (req.user.role !== 'admin') {
      console.error('Access denied: User is not admin. Role:', req.user.role);
      return res.status(403).json({ msg: 'Only admin can upload files' });
    }

    // Extract fields
    const displayName = (req.body.displayName || '').toString().trim();
    const date = (req.body.date || '').toString().trim();
    const personName = (req.body.personName || '').toString().trim();
    const guardianName = (req.body.guardianName || '').toString().trim();
    const propertyNumber = (req.body.propertyNumber || '').toString().trim();
    const address = (req.body.address || '').toString().trim();
    
    console.log('After extraction and trim:', { 
      displayName, 
      personName, 
      guardianName, 
      propertyNumber, 
      address, 
      date 
    });
    
    // Validate required fields
    if (!displayName) {
      return res.status(400).json({ msg: 'Rename File is required' });
    }
    
    if (!guardianName) {
      return res.status(400).json({ msg: 'Guardian Name is required' });
    }
    
    if (!address) {
      return res.status(400).json({ msg: 'Address is required' });
    }
    
    // Generate Sequential GR Number
    const grNumber = await getNextGrNumber();

    const insertData = {
      filename: req.file.filename,
      original_name: req.file.originalname,
      display_name: displayName,
      gr_number: grNumber,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: path.join('uploads', req.file.filename).replace(/\\/g, '/'),
      user_selected_date: normalizeSelectedDate(date),
      person_name: personName,
      guardian_name: guardianName,
      property_number: propertyNumber,
      address: address,
      owner: req.user.id,
      uploaded_by_role: req.user.role
    };

    console.log('Insert data for Supabase:', JSON.stringify(insertData, null, 2));

    const { data: file, error } = await supabase
      .from('files')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ msg: 'Error uploading file', error: error.message });
    }

    console.log('SUCCESS: File inserted');
    console.log('Returned data:', JSON.stringify(file, null, 2));
    console.log('===== UPLOAD COMPLETE =====\n');
    
    res.json(file);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET api/files
// @desc    Get all files for user (with filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { search, date, personName, guardianName, propertyNumber, address } = req.query;
    let query = supabase
      .from('files')
      .select('*');
      

    if (search) {
      // Search by display name, GR number, person name, guardian name, property number, or address (case-insensitive, partial match)
      query = query.or(`display_name.ilike.%${search}%,gr_number.ilike.%${search}%,person_name.ilike.%${search}%,guardian_name.ilike.%${search}%,property_number.ilike.%${search}%,address.ilike.%${search}%`);
    }

    // Add individual field filters if provided
    if (personName) {
      query = query.ilike('person_name', `%${personName}%`);
    }

    if (guardianName) {
      query = query.ilike('guardian_name', `%${guardianName}%`);
    }

    if (propertyNumber) {
      query = query.ilike('property_number', `%${propertyNumber}%`);
    }

    if (address) {
      query = query.ilike('address', `%${address}%`);
    }

    if (date) {
      // Filter by user selected date
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query = query.gte('user_selected_date', start.toISOString());
      query = query.lte('user_selected_date', end.toISOString());
    }

    const { data: files, error } = await query.order('upload_date', { ascending: false });

    if (error) {
      return res.status(500).json({ msg: 'Error fetching files', error: error.message });
    }

    res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/files/:id
// @desc    Get file info
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !file) {
      return res.status(404).json({ msg: 'File not found' });
    }

    res.json(file);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/files/:id/content
// @desc    Serve file content (for preview)
// @access  Private
router.get('/:id/content', async (req, res) => {
    try {
        const token = req.query.token || req.header('x-auth-token');
        if(!token) return res.status(401).send('No token');
        
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        const userId = decoded.user.id;

        const { data: file, error } = await supabase
          .from('files')
          .select('*')
          .eq('id', req.params.id)
          .single();

        if (error || !file) {
          return res.status(404).send('File not found');
        }

        const filePath = path.join(__dirname, '../', file.path);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('File not found on server');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/files/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only admin can delete files' });
    }


    if (error || !file) {
      return res.status(404).json({ msg: 'File not found' });
    }


    // Delete from FS
    const filePath = path.join(__dirname, '../', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      return res.status(500).json({ msg: 'Error deleting file', error: deleteError.message });
    }

    res.json({ msg: 'File removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
