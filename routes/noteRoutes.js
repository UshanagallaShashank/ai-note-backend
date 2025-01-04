const express = require('express');
const Note = require('../models/note');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create a new note
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, startDate, endDate, priority } = req.body;

  try {
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // If no dates provided, let schema handle it by using defaults
    const start = startDate ? new Date(startDate) : new Date(); // Use current time if no startDate provided
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 60 * 1000); // Default endDate 30 mins after startDate

    // Ensure valid dates
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after the start date' });
    }

    // Create new note
    const newNote = new Note({
      title,
      description,
      userId: req.user,
      startDate: start,
      endDate: end,
      priority: priority || 'medium', // Default priority
    });

    await newNote.save();

    // Convert to plain object and include virtual fields
    const noteObject = newNote.toObject();

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        ...noteObject,
        duration: noteObject.duration,
        timeLeft: noteObject.timeLeft,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating note', error: err.message });
  }
});


// Get all notes for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { priority, isCompleted } = req.query;

    // Filter notes based on query parameters
    const filter = { userId: req.user};
    if (priority) filter.priority = priority;
    if (isCompleted !== undefined) filter.isCompleted = isCompleted === 'true';

    const notes = await Note.find(filter);
    const notesWithExtras = notes.map(note => ({
      ...note.toObject(),
      duration: note.duration,
      timeLeft: note.timeLeft,
    }));

    res.status(200).json(notesWithExtras);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes', error: err.message });
  }
});

// Update a note
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, startDate, endDate, priority, isCompleted } = req.body;

  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user});
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Update fields if provided
    note.title = title || note.title;
    note.description = description || note.description;
    note.priority = priority || note.priority;

    if (startDate) note.startDate = new Date(startDate);
    if (endDate) note.endDate = new Date(endDate);

    // Ensure endDate is after startDate
    if (note.startDate >= note.endDate) {
      return res.status(400).json({ message: 'End date must be after the start date' });
    }

    // Update completion status
    if (isCompleted !== undefined) note.isCompleted = isCompleted;

    await note.save();
    res.status(200).json({
      message: 'Note updated successfully',
      note: {
        ...note.toObject(),
        duration: note.duration,
        timeLeft: note.timeLeft,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating note', error: err.message });
  }
});

// Delete a note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting note', error: err.message });
  }
});

// Mark a note as completed
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isCompleted = true;
    await note.save();

    res.status(200).json({ message: 'Note marked as completed', note });
  } catch (err) {
    res.status(500).json({ message: 'Error marking note as completed', error: err.message });
  }
});

// Get a single note by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.status(200).json({
      ...note.toObject(),
      duration: note.duration,
      timeLeft: note.timeLeft,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching note', error: err.message });
  }
});


const calculateTimeLeft = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  if (diff < 0) return "Task has expired";

  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  if (days > 0) return `${days} day(s) left`;
  if (hours > 0) return `${hours} hour(s) left`;
  if (minutes > 0) return `${minutes} minute(s) left`;

  return "Due now";
};

router.get('/notes-by-time', authMiddleware, async (req, res) => {
  try {
    console.log("user: ",req.user)
    const notes = await Note.find({ userId: req.user });

    if (!notes.length) {
      return res.status(200).json({
        message: "No tasks found.",
        categorizedTasks: {
          overdue: [],
          dueSoon: [],
          completed: [],
        },
      });
    }

    const categorizedTasks = {
      overdue: [],
      dueSoon: [],
      completed: [],
    };

    notes.forEach((note) => {
      const timeLeft = calculateTimeLeft(note.endDate);
      const task = {
        ...note.toObject(),
        timeLeft,
      };

      if (note.isCompleted) {
        categorizedTasks.completed.push(task);
      } else if (timeLeft === "Task has expired") {
        categorizedTasks.overdue.push(task);
      } else if (timeLeft.includes("day(s)") || timeLeft.includes("hour(s)") || timeLeft.includes("minute(s)")) {
        categorizedTasks.dueSoon.push(task);
      }
    });

    res.status(200).json({
      message: "Tasks categorized successfully.",
      categorizedTasks,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
});

module.exports = router;
