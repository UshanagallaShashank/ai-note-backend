const express = require('express');
const Note = require('../models/note');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create a new note
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;

  try {
    const newNote = new Note({
      title,
      description,
      userId: req.user.userId, // Added by auth middleware
    });

    await newNote.save();
    res.status(201).json({ message: 'Note created successfully', note: newNote });
  } catch (err) {
    res.status(500).json({ message: 'Error creating note', error: err.message });
  }
});

// Get all notes for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes', error: err.message });
  }
});

// Update a note
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description } = req.body;

  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.title = title || note.title;
    note.description = description || note.description;

    await note.save();
    res.status(200).json({ message: 'Note updated successfully', note });
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
