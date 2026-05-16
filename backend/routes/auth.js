const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Password strength validation — same 5 rules as the frontend meter
function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push('Must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Must contain a number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Must contain a special character (!@#$...)');
  return errors;
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate password strength
    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) {
      return res.status(400).json({ message: 'Weak password: ' + pwErrors.join(', ') });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    // Always create as passenger — only admins can promote users via admin panel
    const user = await User.create({ name, email, passwordHash, role: 'passenger' });
    res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json(user);
});

router.patch('/me', auth, async (req, res) => {
  try {
    const { name, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (password) {
      // Validate password strength
      const pwErrors = validatePassword(password);
      if (pwErrors.length > 0) {
        return res.status(400).json({ message: 'Weak password: ' + pwErrors.join(', ') });
      }
      updates.passwordHash = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Forgot Password ──
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been generated.' });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Store hashed version in DB
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Build the reset link
    const resetLink = `http://localhost:5173/reset-password/${rawToken}`;

    // In production, send via email (Nodemailer / SendGrid etc.)
    // For development, log the link to the console
    console.log(`\n🔑 Password reset link for ${email}:\n   ${resetLink}\n`);

    res.json({
      message: 'If an account with that email exists, a reset link has been generated.',
      // Only include the link in development for easy testing
      ...(process.env.NODE_ENV !== 'production' && { resetLink })
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Reset Password ──
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Validate password strength
    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) {
      return res.status(400).json({ message: 'Weak password: ' + pwErrors.join(', ') });
    }

    // Hash the incoming token to compare with the stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    // Update password and clear reset fields
    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
