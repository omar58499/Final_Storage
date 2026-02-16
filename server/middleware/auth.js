const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

module.exports = async function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Always fetch fresh user from DB
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', decoded.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    req.user = user; // now includes role
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
