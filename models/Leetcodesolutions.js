const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },
  solutions: [{
    language: String,
    approach: String,
    code: String,
    sourceUrl: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SolutionSet', solutionSchema);