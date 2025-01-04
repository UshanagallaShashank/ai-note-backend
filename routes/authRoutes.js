const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, bio, preferences } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password


    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      bio,
      preferences,
    });

    await newUser.save();

    // Create JWT Token


    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      // console.error('User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the provided password with the stored hashed password using the matchPassword method
    const isMatch = await user.matchPassword(password); // Using the custom method `matchPassword`

    if (!isMatch) {
      console.error('Invalid credentials');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // console.log("token : ",token)

    // console.log('Login successful:', email);
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});


// Fetch user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user profile', error: err.message });
  }
});

// Update user profile (bio, preferences, etc.)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, preferences, bio, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      { username, email, preferences, bio, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user profile', error: err.message });
  }
});

// Add a new habit
router.post('/habits', authMiddleware, async (req, res) => {
  try {
    const { habitName } = req.body;

    // Validate input
    if (!habitName || habitName.trim() === '') {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    // Find the user using the ID from `req.user`
    const user = await User.findById(req.user._id); // Ensure `authMiddleware` sets req.user correctly
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the new habit
    user.habits.push({ habitName, streak: 0, longestStreak: 0 });
    await user.save();

    res.status(201).json({ 
      message: 'Habit added successfully', 
      habits: user.habits 
    });
  } catch (err) {
    console.error('Error adding habit:', err); // Log error for debugging
    res.status(500).json({ 
      message: 'Error adding habit', 
      error: err.message 
    });
  }
});


// Update habit streak
router.put('/habits/:habitId', authMiddleware, async (req, res) => {
  try {
    const { habitId } = req.params;
    const { streak } = req.body;
    // console.log("object: ",req.user)
    const user = await User.findById(req.user);
      // console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const habit = user.habits.id(habitId);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    habit.streak = streak; // Update streak
    await user.save();

    res.status(200).json({ message: 'Habit streak updated successfully', habit });
  } catch (err) {
    res.status(500).json({ message: 'Error updating habit streak', error: err.message });
  }
});

// Reset habit streak
router.put('/habits/:habitId/reset', authMiddleware, async (req, res) => {
  try {
    const { habitId } = req.params;

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const habit = user.habits.id(habitId);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    habit.streak = 0; // Reset streak
    await user.save();

    res.status(200).json({ message: 'Habit streak reset successfully', habit });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting habit streak', error: err.message });
  }
});

module.exports = router;
