const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// @route   GET api/auth/verify
// @desc    Verify auth token
// @access  Private
router.get('/verify', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    console.log('User verification:', { id: user.id, email: user.email, role: user.role });

    res.json({
      valid: true,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Verification failed' });
  }
});

// @route   POST api/auth/make-admin
// @desc    Make user admin (first user becomes admin)
// @access  Private
router.post('/make-admin', auth, async (req, res) => {
  try {
    // Count total users
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    // Only allow if first user or if already admin
    if (count === 1 || req.user.role === 'admin') {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ msg: 'Error updating user', error: error.message });
      }

      console.log('User promoted to admin:', updatedUser.email);
      res.json({ msg: 'User is now admin', user: updatedUser });
    } else {
      res.status(403).json({ msg: 'Only first user can be made admin' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, role: 'user' }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ msg: 'Error creating user' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || error) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
