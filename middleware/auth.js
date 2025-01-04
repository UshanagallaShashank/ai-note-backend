const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const User = require('../models/user'); // Assuming you have a User model

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId); // Ensure this works correctly
    req.user=req.user._id; // Add this log

    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.', err: error.message });
  }
};


module.exports = authMiddleware;
=======

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info (e.g., userId) to the request object
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};
>>>>>>> 916248d22c2765a5b2f4498bcda2872a765fc383
