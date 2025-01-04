const express = require('express');
const Note = require('../models/note');
const User=require("../models/user")
const authMiddleware = require('../middleware/auth');
const {
  summarizeNotes,
  detectPriority,
  analyzeSentiment,
  lifestyleSuggestions,
  timeManagementTips,
  productivityToolsSuggestion,
  generateAIInsights
} = require('../utils/aiHelper');

const router = express.Router();

/**
 * Get daily summary of notes.
 */
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notes = await Note.find({
      userId: req.user,
      startDate: { $gte: today },
    });

    if (!notes.length) {
      return res.status(200).json({ summary: "No tasks for today! You're all caught up." });
    }

    const summary = summarizeNotes(notes);
    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching daily summary', error: err.message });
  }
});

/**
 * Get priorities for all notes.
 */
router.get('/priorities', authMiddleware, async (req, res) => {
  try {
    // Fetch only necessary fields from the database to improve performance
    const notes = await Note.find({ userId: req.user }).select('title priority startDate endDate isCompleted');

    // Check if there are no notes
    if (!notes.length) {
      return res.status(200).json({
        priorities: [],
        message: "No tasks found. Start organizing your priorities!",
      });
    }

    // Categorize and map notes into priority groups
    const categorizedPriorities = notes.reduce(
      (acc, note) => {
        const { title, priority, startDate, endDate, isCompleted } = note;

        // Classify priority based on status and urgency
        const status = isCompleted
          ? 'Completed'
          : new Date(endDate) < new Date()
          ? 'Overdue'
          : 'Active';

        const priorityData = {
          title,
          priority: priority || 'low', // Default to 'low' if not set
          status,
          startDate,
          endDate,
        };

        // Group by priority (high, medium, low)
        acc[priority || 'low'].push(priorityData);
        return acc;
      },
      { high: [], medium: [], low: [] } // Initial structure
    );

    res.status(200).json({
      message: "Priorities fetched successfully.",
      priorities: categorizedPriorities,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching priorities', error: err.message });
  }
});



/**
 * Get sentiment analysis for all notes.
 */
router.get('/sentiment', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user });

    if (!notes.length) {
      return res.status(200).json({ sentimentAnalysis: "No notes to analyze." });
    }

    const sentimentAnalysis = analyzeSentiment(notes);
    res.status(200).json({ sentimentAnalysis });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sentiment analysis', error: err.message });
  }
});

/**
 * Get lifestyle suggestions based on user's notes.
 */
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user });

    if (!notes.length) {
      return res.status(200).json({ suggestions: "No tasks logged. Make sure to track your day!" });
    }

    const suggestions = lifestyleSuggestions(notes);
    res.status(200).json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lifestyle suggestions', error: err.message });
  }
});

/**
 * Get time management tips based on user's notes.
 */
router.get('/time-management', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const notes = await Note.find({ userId: req.user });

    if (!notes.length) {
      return res.status(200).json({ tips: "No tasks logged. Plan your day to stay productive!" });
    }

    const tips = timeManagementTips(notes,user);
    res.status(200).json({ tips });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching time management tips', error: err.message });
  }
});

/**
 * Get a random productivity tool suggestion.
 */
router.get('/productivity-tools', authMiddleware, async (req, res) => {
  try {
    // Fetch user details to personalize suggestions
    const user = await User.findById(req.user).select('preferences activity habits');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch user-specific preferences and activity
    const { preferences, activity } = user;

    // Generate personalized suggestion
    const suggestion = productivityToolsSuggestion(preferences);

    // Add context based on user's activity
    const lastLogin = activity?.lastLogin
      ? `Your last login was on ${new Date(activity.lastLogin).toLocaleDateString()}`
      : 'Welcome back!';
    const tasksCompleted = activity?.tasksCompleted
      ? `You've completed ${activity.tasksCompleted} tasks so far. Great job!`
      : "Let's start tracking your tasks for better insights.";

    // Construct the response
    res.status(200).json({
      message: 'Here’s your productivity suggestion!',
      suggestion,
      context: {
        lastLogin,
        tasksCompleted,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching productivity tool suggestion', error: err.message });
  }
});



/**
 * Get AI-generated insights based on notes.
 */
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    // Assuming authMiddleware sets req.user with user details
    const userId = req.user; // Use correct property from req.user
    console.log("object",userId)
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notes = await Note.find({ userId });

    if (!notes.length) {
      return res.status(200).json({ insights: "No tasks logged to generate insights." });
    }

    const insights = generateAIInsights(notes);
    res.status(200).json({ insights });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching AI insights', error: err.message });
  }
});



module.exports = router;
