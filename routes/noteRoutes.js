const express = require('express');
const Note = require('../models/note');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create a new note
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, startDate, endDate } = req.body;
  
    try {
      // Ensure startDate and endDate are valid
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start and End dates are required' });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return res.status(400).json({ message: 'End date must be after the start date' });
      }
  
      // Create the note
      const newNote = new Note({
        title,
        description,
        userId: req.user.userId,
        startDate: start,
        endDate: end,
      });
  
      await newNote.save();
      res.status(201).json({
        message: 'Note created successfully',
        note: {
          ...newNote.toObject(),
          duration: newNote.duration,
          timeLeft: newNote.timeLeft,
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Error creating note', error: err.message });
    }
  });
  
// Get all notes for the user
router.get('/', authMiddleware, async (req, res) => {
    try {
      const notes = await Note.find({ userId: req.user.userId });
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
    const { title, description, startDate, endDate } = req.body;
  
    try {
      const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });
      if (!note) return res.status(404).json({ message: 'Note not found' });
  
      // Update fields if provided
      note.title = title || note.title;
      note.description = description || note.description;
  
      if (startDate) note.startDate = new Date(startDate);
      if (endDate) note.endDate = new Date(endDate);
  
      // Ensure endDate is after startDate
      if (note.startDate >= note.endDate) {
        return res.status(400).json({ message: 'End date must be after the start date' });
      }
  
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
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting note', error: err.message });
  }
});

module.exports = router;
