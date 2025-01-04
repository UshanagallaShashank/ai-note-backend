const express = require('express');
const router = express.Router();
const Note = require('../../models/note');
const User = require('../../models/user');
const authMiddleware = require('../../middleware/auth');

// Get all notes for a specific user by email (Admin only)
router.get('/user/:email', authMiddleware, async (req, res) => {
  try {
    const userId = req.user; 

    const loggedInUser = await User.findById(userId);
    if ( !loggedInUser.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only' });
    }

    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with the provided email' });
    }
    const notes = await Note.find({ userId: user._id });
    if (notes.length === 0) {
      return res.status(404).json({ message: 'No notes found for this user' });
    }

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes', error: err.message });
  }
});


// Get all notes for multiple users by their emails (Admin only)
router.get('/allnotes', authMiddleware, async (req, res) => {
    try {
      const userId = req.user; 
  
      const loggedInUser = await User.findById(userId);
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only' });
      }
  
      const notes = await Note.find({});
      if (notes.length === 0) {
        return res.status(404).json({ message: 'No notes found' });
      }
  
      const userIds = [...new Set(notes.map(note => note.userId.toString()))];
  
      const users = await User.find({ '_id': { $in: userIds } });
      if (users.length === 0) {
        return res.status(404).json({ message: 'No users found for these notes' });
      }
  
      const userIdToEmail = users.reduce((acc, user) => {
        acc[user._id.toString()] = user.email;
        return acc;
      }, {});
  
      const result = userIds.reduce((acc, userId) => {
        const email = userIdToEmail[userId];
  
        // Filter notes for this userId
        const userNotes = notes.filter(note => note.userId.toString() === userId);
  
        if (userNotes.length > 0) {
          acc.push({ email, notes: userNotes });
        }
  
        return acc;
      }, []);
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'No notes found for these users' });
      }
  
      // Return the result with emails and their corresponding notes
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching notes', error: err.message });
    }
  });
  


//based on id
  router.get('/:noteId', authMiddleware, async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const { noteId } = req.params; 
  
      const loggedInUser = await User.findById(loggedInUserId);
      if (!loggedInUser.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only' });
      }
  
      // Fetch the note by noteId
      const note = await Note.findById(noteId);
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
  
      // Return the note details
      res.status(200).json({ note });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching note', error: err.message });
    }
  });
  
  

// Create a new note (Admin can pass email, and the user will be created or updated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user; 
    const loggedInUser = await User.findById(userId);
    if ( !loggedInUser.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only' });
    }

    const { email, title, description, startDate, endDate, priority } = req.body;
    if (!email || !title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with the provided email' });
    }

    const newNote = new Note({
      title,
      description,
      userId: user._id,
      startDate,
      endDate,
      priority,
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ message: 'Error creating note', error: err.message });
  }
});


// Update an existing note by note ID (Admin only)
router.put('/:noteId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user; 
    const loggedInUser = await User.findById(userId);
    if ( !loggedInUser.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only' });
    }

    const { noteId } = req.params;
    const { email, title, description, startDate, endDate, priority } = req.body;

    // Find the note by ID
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found with the provided email' });
      }
      note.userId = user._id; // Update userId to new user's ID if email is provided
    }

    // Update note fields if provided
    if (title) note.title = title;
    if (description) note.description = description;
    if (startDate) note.startDate = new Date(startDate);
    if (endDate) note.endDate = new Date(endDate);
    if (priority) note.priority = priority;

    await note.save();
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Error updating note', error: err.message });
  }
});

module.exports = router;
