const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  verifyOTP, 
  authUser, 
  getUserProfile, 
  getUsers, 
  updateUser, 
  updateUserProfile,
  forgotPassword,
  verifyForgotOTP,
  resetPassword
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const { admin } = require('../middlewares/adminMiddleware');

router.post('/', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-otp', verifyForgotOTP);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/', protect, admin, getUsers);
router.put('/:id', protect, admin, updateUser);

module.exports = router;
