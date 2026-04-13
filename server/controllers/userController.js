const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// Lưu trữ OTP tạm thời trong bộ nhớ (có thể dùng Redis hoặc lưu trong DB để an toàn hơn cho production)
const otpStore = new Map();

// @desc    Register a new user (and send OTP)
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, name, password, expires: Date.now() + 10 * 60 * 1000 }); // OTP valid for 10 mins

    // Send email
    const message = `Mã xác thực OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`;
    try {
      await sendEmail({
        email,
        subject: 'Xác thực tài khoản Laptop Galaxy Store',
        message
      });
      res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and Create Account
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const storeData = otpStore.get(email);

  if (!storeData) {
    return res.status(400).json({ message: 'OTP not found or expired' });
  }

  if (Date.now() > storeData.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (storeData.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Create user
  try {
    const userExists = await User.findOne({ email });
    let user;
    if (userExists) {
      userExists.name = storeData.name;
      userExists.password = storeData.password;
      userExists.isVerified = true;
      user = await userExists.save();
    } else {
      user = await User.create({
        name: storeData.name,
        email,
        password: storeData.password,
        isVerified: true
      });
    }

    otpStore.delete(email);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Tài khoản chưa được xác thực' });
      }
      if (user.isBlocked) {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị Chỉ Huy Trưởng Vô Hiệu Hóa' });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.isAdmin !== undefined) updateData.isAdmin = req.body.isAdmin;
    if (req.body.isBlocked !== undefined) updateData.isBlocked = req.body.isBlocked;
    if (req.body.avatar !== undefined) updateData.avatar = req.body.avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (updatedUser) {
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        avatar: updatedUser.avatar
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(`Error in updateUser: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request forgot password OTP
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000, type: 'forgotPassword' });

    // Send email
    const message = `Mã OTP của bạn để đặt lại mật khẩu là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`;
    try {
      await sendEmail({
        email,
        subject: 'Đặt lại mật khẩu Laptop Galaxy Store',
        message
      });
      res.status(200).json({ message: 'OTP đã được gửi đến email của bạn' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Không thể gửi email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify forgot password OTP
// @route   POST /api/users/verify-forgot-otp
// @access  Public
const verifyForgotOTP = async (req, res) => {
  const { email, otp } = req.body;
  const storeData = otpStore.get(email);

  if (!storeData || storeData.type !== 'forgotPassword') {
    return res.status(400).json({ message: 'OTP không tìm thấy hoặc đã hết hạn' });
  }

  if (Date.now() > storeData.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP đã hết hạn' });
  }

  if (storeData.otp !== otp) {
    return res.status(400).json({ message: 'Mã OTP không chính xác' });
  }

  res.status(200).json({ message: 'OTP xác thực thành công' });
};

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  const storeData = otpStore.get(email);

  if (!storeData || storeData.type !== 'forgotPassword' || storeData.otp !== otp) {
    return res.status(400).json({ message: 'Yêu cầu không hợp lệ hoặc OTP đã hết hạn' });
  }

  if (Date.now() > storeData.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP đã hết hạn' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    user.password = password;
    await user.save();

    otpStore.delete(email);

    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
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
};
