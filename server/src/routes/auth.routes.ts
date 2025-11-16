import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Register new user
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('role').isIn(['renter', 'lender']),
    body('phone').optional().isMobilePhone('en-IN'),
    validate
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate
  ],
  login
);

// Logout
router.post('/logout', authenticate, logout);

// Get current user
router.get('/me', authenticate, getCurrentUser);

// Refresh token
router.post('/refresh', refreshToken);

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
    validate
  ],
  forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 }),
    validate
  ],
  resetPassword
);

// Verify email
router.get('/verify-email/:token', verifyEmail);

export default router;
