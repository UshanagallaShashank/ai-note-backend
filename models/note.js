const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  date: { type: Date, default: Date.now }, // Creation date
  isCompleted: { type: Boolean, default: false }, // Track completion status
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, // Task priority
  lastNotificationSent: { type: Date, default: null }, // Tracks last email notification
  outdated: { type: Boolean, default: false }, // Persistent field for outdated status
});

// Middleware to set the `outdated` field before saving
noteSchema.pre('save', function (next) {
  const now = new Date();
  this.outdated = this.endDate < now; // Update outdated status based on endDate
  next();
});

// Middleware to set `outdated` field before updating
noteSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const now = new Date();

  if (update.endDate) {
    update.outdated = new Date(update.endDate) < now;
  } else if (update.$set && update.$set.endDate) {
    update.$set.outdated = new Date(update.$set.endDate) < now;
  }

  next();
});

// Virtual field to calculate duration (days/hours/minutes taken)
noteSchema.virtual('duration').get(function () {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffMs = end - start;

  const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
  const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return { days, hours, minutes };
});

// Virtual field to calculate time left
noteSchema.virtual('timeLeft').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffMs = end - now;

  if (diffMs <= 0) {
    return 'Task has expired';
  }

  const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
  const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return { days, hours, minutes };
});

// Instance method to mark a note as completed
noteSchema.methods.markAsCompleted = async function () {
  this.isCompleted = true;
  await this.save();
};

// Indexing for faster user-specific queries
noteSchema.index({ userId: 1 });

// Ensure virtuals are included when converting the document to plain object or JSON
noteSchema.set('toObject', { virtuals: true });
noteSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Note', noteSchema);
