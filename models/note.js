const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  date: { type: Date, default: Date.now }, 
});

// Virtual field to calculate duration (days/hours taken)
noteSchema.virtual('duration').get(function () {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  return { days, hours: hours % 24 };
});

// Virtual field to calculate time left
noteSchema.virtual('timeLeft').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffMs = end - now;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  return { days, hours: hours % 24 };
});

module.exports = mongoose.model('Note', noteSchema);
