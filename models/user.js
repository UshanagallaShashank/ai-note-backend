<<<<<<< HEAD
  const mongoose = require('mongoose');
  const bcrypt = require('bcrypt');

  const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' }, // URL for profile picture
    bio: { type: String, default: '' }, // User's short bio
    preferences: {
      theme: { type: String, default: 'light' }, // light or dark theme
      notifications: { type: Boolean, default: true }, // Enable or disable notifications
      language: { type: String, default: 'en' }, // Default language
    },
    activity: {
      lastLogin: { type: Date, default: Date.now }, // Last login timestamp
      totalLogins: { type: Number, default: 0 }, // Number of logins
      tasksCompleted: { type: Number, default: 0 }, // Number of tasks completed
    },
    habits: [
      {
        habitName: { type: String },
        streak: { type: Number, default: 0 }, // Current streak
        longestStreak: { type: Number, default: 0 }, // Longest streak
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isAdmin: { type: Boolean, default: false },  // Admin flag
    createdAt: { type: Date, default: Date.now }, // Account creation date
  });

  // Hash the password before saving the user
  UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  // Compare passwords
  UserSchema.methods.matchPassword = function (password) {
    return bcrypt.compare(password, this.password);
  };


  const User = mongoose.model('User', UserSchema);
  module.exports = User;
=======
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare passwords
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
>>>>>>> 916248d22c2765a5b2f4498bcda2872a765fc383
