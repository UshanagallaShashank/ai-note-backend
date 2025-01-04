// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   profilePicture: { type: String, default: '' }, // URL for profile picture
//   bio: { type: String, default: '' }, // User's short bio
//   preferences: {
//     theme: { type: String, default: 'light' }, // light or dark theme
//     notifications: { type: Boolean, default: true }, // Enable or disable notifications
//     language: { type: String, default: 'en' }, // Default language
//   },
//   activity: {
//     lastLogin: { type: Date, default: Date.now }, // Last login timestamp
//     totalLogins: { type: Number, default: 0 }, // Number of logins
//     tasksCompleted: { type: Number, default: 0 }, // Number of tasks completed
//   },
//   habits: [
//     {
//       habitName: { type: String },
//       streak: { type: Number, default: 0 }, // Current streak
//       longestStreak: { type: Number, default: 0 }, // Longest streak
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
//   isAdmin: { type: Boolean, default: false },  // Admin flag
//   createdAt: { type: Date, default: Date.now }, // Account creation date
// });

// // Hash the password before saving the user
// UserSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// // Compare passwords
// UserSchema.methods.matchPassword = function (password) {
//   return bcrypt.compare(password, this.password);
// };


// const User = mongoose.model('User', UserSchema);
// module.exports = User;


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
  isAdmin: { type: Boolean, default: false }, // Admin flag
  isActive: { type: Boolean, default: false }, // Whether the user account is active
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

// Method to check if the user is an admin
UserSchema.methods.hasAdminAccess = function () {
  return this.isAdmin;
};

// Method to deactivate user account (Admin only)
UserSchema.methods.deactivateAccount = function () {
  if (this.isAdmin) {
    this.isActive = false;
    return this.save();
  } else {
    throw new Error('Only admins can deactivate accounts');
  }
};

// Method to activate user account (Admin only)
UserSchema.methods.activateAccount = function () {
  if (this.isAdmin) {
    this.isActive = true;
    return this.save();
  } else {
    throw new Error('Only admins can activate accounts');
  }
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
