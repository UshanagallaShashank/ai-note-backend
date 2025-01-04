 const startScheduler=require("../services/notificationScheduler")
const scheduleTaskNotification =async () => {
    console.log('Scheduler will run every 30 minutes.');
  
    // Call the startScheduler function immediately (for the first time)
    await startScheduler();
  
    // Schedule the function to run every 5 minutes
    setInterval(async () => {
      console.log('Running task notification scheduler...');
      await startScheduler(); // Call your existing scheduler logic
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
  };

  module.exports = scheduleTaskNotification;