const express = require('express');
const startScheduler = require('../services/notificationScheduler'); // Update with the actual path to your scheduler file
const router = express.Router();

router.get('/trigger-scheduler', async (req, res) => {
  try {
    console.log('Manually triggering the scheduler...');
    await startScheduler(); // Call the scheduler
    res.status(200).json({ message: 'Scheduler triggered successfully.' });
  } catch (error) {
    console.error('Error triggering scheduler:', error.message);
    res.status(500).json({ message: 'Error triggering scheduler', error: error.message });
  }
});

module.exports = router;
