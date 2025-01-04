const express = require('express');
const router = express.Router();
const Note = require('../../models/note');
const User = require('../../models/user');
const authMiddleware = require('../../middleware/auth');
const sendEmail = require('../../services/sendMail'); 
//get all users
router.get('/all-users', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const loggedInUser = await User.findById(loggedInUserId);
      
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Admins only' });
      }
  
      const users = await User.find();
      res.status(200).json({ users });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
  });
  

//get 1 user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const loggedInUser = await User.findById(loggedInUserId);
    
    if (!loggedInUser.isAdmin) {
      return res.status(403).json({ message: 'Admins only' });
    }

    const { userId } = req.params; // Get the userId from the URL parameter

    // Fetch the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});


//1user create
router.post('/create', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const loggedInUser = await User.findById(loggedInUserId);
      
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Admins only' });
      }
  
      const { email, isAdmin = false, isActive = true } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: 'Please provide an email' });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
  
      const newUser = new User({
        email,
        username: email.split('@')[0],
        password: 'pass123#', // Default password
        isAdmin,
        isActive
      });
  
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
      res.status(500).json({ message: 'Error creating user', error: err.message });
    }
  });
  

//multiple-create
router.post('/create-multiple', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const loggedInUser = await User.findById(loggedInUserId);
      
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Admins only' });
      }
  
      const { emails, isAdmin = false, isActive = true } = req.body;
  
      if (!emails || !Array.isArray(emails)) {
        return res.status(400).json({ message: 'Please provide an array of emails' });
      }
  
      const newUsers = [];
      for (let email of emails) {
        const existingUser = await User.findOne({ email });
        if (existingUser) continue;
  
        const newUser = new User({
          email,
          username: email.split('@')[0],
          password: 'pass123#', 
          isAdmin,
          isActive
        });
  
        await newUser.save();
        newUsers.push(newUser);
      }
  
      res.status(201).json({ message: 'Users created successfully', users: newUsers });
    } catch (err) {
      res.status(500).json({ message: 'Error creating users', error: err.message });
    }
  });
  


//update-id
router.put('/update/:userId', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const loggedInUser = await User.findById(loggedInUserId);
      
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Admins only' });
      }
  
      const { userId } = req.params;
      const { isAdmin, isActive, username, bio, preferences } = req.body;
      const userToUpdate = await User.findById(userId);
      
      if (!userToUpdate) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (isAdmin !== undefined) userToUpdate.isAdmin = isAdmin;
      if (isActive !== undefined) userToUpdate.isActive = isActive;
      if (username) userToUpdate.username = username;
      if (bio) userToUpdate.bio = bio;
      if (preferences) userToUpdate.preferences = preferences;
  
      await userToUpdate.save();
      res.status(200).json({ message: 'User updated successfully', user: userToUpdate });
    } catch (err) {
      res.status(500).json({ message: 'Error updating user', error: err.message });
    }
  });

  
  //delete user
  router.delete('/delete/:userId', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const loggedInUser = await User.findById(loggedInUserId);
      
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Admins only' });
      }
  
      const { userId } = req.params;
      const userToDelete = await User.findById(userId);
  
      if (!userToDelete) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Use deleteOne() or findByIdAndDelete() for removal
      await User.findByIdAndDelete(userId);
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
  });
  

//isverfied
  router.put('/isverified/:userId', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const loggedInUser = await User.findById(loggedInUserId);
      
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Admins only' });
      }
  
      const { userId } = req.params;
      const userToUpdate = await User.findById(userId);
  
      if (!userToUpdate) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      userToUpdate.isActive = !userToUpdate.isActive;
      await userToUpdate.save();
  
      res.status(200).json({ message: 'User active status toggled', user: userToUpdate });
    } catch (err) {
      res.status(500).json({ message: 'Error toggling user active status', error: err.message });
    }
  });


//get activity
  router.get('/activity/:userId', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const loggedInUser = await User.findById(loggedInUserId);
      
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Admins only' });
      }
  
      const { userId } = req.params;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const userActivity = {
        lastLogin: user.activity.lastLogin,
        totalLogins: user.activity.totalLogins,
        tasksCompleted: user.activity.tasksCompleted,
        streak: user.habits ? user.habits.reduce((acc, habit) => acc + habit.streak, 0) : 0,
      };
  
      res.status(200).json({ userActivity });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching activity', error: err.message });
    }
  });
  

  //make admin

 // Adjust the path as needed

  router.patch('/make-admin', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;  // ID of the currently logged-in user
      const loggedInUser = await User.findById(loggedInUserId);
  
      // Check if the logged-in user is an admin
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Admins only' });
      }
  
      const { email } = req.body;  // Email of the user to be made an admin
  
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      // Find the user to be made admin
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user is already an admin
      if (user.isAdmin) {
        return res.status(400).json({ message: 'User is already an admin' });
      }
  
      // Update the user's isAdmin status
      user.isAdmin = true;
      await user.save();
  
      // Send an email to the user notifying them they have been made an admin
      const subject = 'You have been granted admin privileges';
      const emailContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333;
              }
              .warning {
                color: red;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1>Important Information</h1>
            <p>Hello ${user.username},</p>
            <p>You have been granted <strong>admin privileges</strong> for your account on our platform.</p>
            <p class="warning">This email is confidential and should not be forwarded.</p>
            <p>Best regards,<br>Your Team</p>
          </body>
        </html>
      `;
      await sendEmail(user.email, subject, emailContent);
  
      res.status(200).json({ message: `${email} has been made an admin` });
    } catch (err) {
      res.status(500).json({ message: 'Error making user an admin', error: err.message });
    }
  });
  
  

  //remove admin
  router.patch('/remove-admin', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const loggedInUser = await User.findById(loggedInUserId);
  
      // Check if the logged-in user is an admin
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Admins only' });
      }
  
      const { email } = req.body; // Get the email from the request body
  
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user is already not an admin (optional step to prevent unnecessary updates)
      if (!user.isAdmin) {
        return res.status(400).json({ message: 'User is not an admin' });
      }
  
      // Update the user's isAdmin status to false
      user.isAdmin = false;
      await user.save();
  
      res.status(200).json({ message: `${email} has been removed as an admin` });
    } catch (err) {
      res.status(500).json({ message: 'Error removing admin privileges', error: err.message });
    }
  });
  
  module.exports = router;

