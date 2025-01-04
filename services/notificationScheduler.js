
const nodemailer = require('nodemailer');
const Note = require('../models/note');
const User = require('../models/user');

// Function to fetch a random quote from a predefined list
const getRandomQuote = () => {
  const quotes = [
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "You are never too old to set another goal or to dream a new dream.",
    "Believe you can and you're halfway there.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Success usually comes to those who are too busy to be looking for it.",
    "Hardships often prepare ordinary people for an extraordinary destiny.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "You don't have to be great to start, but you have to start to be great.",
    "Success is not in what you have, but who you are."
  ];

  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

const startScheduler = async () => {
  console.log("Scheduler initialized...");

  // Configure the transporter for email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error("Error in email transporter:", error);
    } else {
      console.log("Email transporter is ready to send messages.");
    }
  });

  // Function to send a summary email of all tasks for a user
  const sendNotification = async (userEmail, tasks) => {
    const randomQuote = getRandomQuote();

    // Build the tasks list to include in the email
    let tasksHtml = tasks.map(note => {
      return `
        <div class="task">
          <h4>${note.title}</h4>
          <div class="task-details">
            <p><span>Description:</span> ${note.description}</p>
            <p><span>Deadline:</span> ${new Date(note.endDate).toLocaleString()}</p>
            <p><span>Status:</span> ${note.isCompleted ? 'Completed' : 'Pending'}</p>
            <p><span>Outdated:</span> ${note.outdated ? 'Yes' : 'No'}</p>
          </div>
        </div>
      `;
    }).join('');

    const emailContent = `
 <html>
  <head>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f0f4f7;
      }
      .container {
        width: 100%;
        max-width: 650px;
        margin: 0 auto;
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      }
      h2 {
        text-align: center;
        color: #333;
        font-size: 24px;
        margin-bottom: 20px;
      }
      .task-list {
        margin: 20px 0;
      }
      .task {
        padding: 15px;
        margin: 10px 0;
        border: 1px solid #ddd;
        border-radius: 6px;
        background-color: #fafafa;
        transition: background-color 0.3s;
      }
      .task:hover {
        background-color: #f1f1f1;
      }
      .task h4 {
        margin: 0;
        color: #333;
        font-size: 20px;
        font-weight: 600;
      }
      .task p {
        color: #555;
        margin: 5px 0;
      }
      .task-details span {
        font-weight: 600;
        color: #007bff;
      }
      .quote {
        font-style: italic;
        color: #555;
        background-color: #f0f4f7;
        padding: 20px;
        margin-top: 30px;
        border-left: 5px solid #007bff;
      }
      .footer {
        text-align: center;
        color: #aaa;
        font-size: 12px;
        margin-top: 40px;
      }
      .footer p {
        margin: 0;
      }
      .btn {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-size: 14px;
        text-align: center;
      }
      .btn:hover {
        background-color: #0056b3;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Your Task Reminder</h2>
      <p>Hello,</p>
      <p>You have the following tasks:</p>
      
      <div class="task-list">
        ${tasksHtml}
      </div>

      <p class="quote">"${randomQuote}"</p>

      <p>Best regards,</p>
      <p><em>Task Management System</em></p>

      <div class="footer">
        <p>This is an automated reminder. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
</html>

    `;

    const mailOptions = {
      from: '"Task Management System" <no-reply@example.com>',
      to: userEmail,
      subject: `Reminder: Tasks Due Soon`,
      html: emailContent,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`Error sending notification to ${userEmail}:`, error.message);
    }
  };

  console.log("Running task notification scheduler...");

  const now = new Date();
  const soon = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now


  try {
    // Fetch all notes due soon or outdated
    const notes = await Note.find({
      $or: [
        { endDate: { $gte: now, $lte: soon }, isCompleted: false },
        { endDate: { $lt: now }, isCompleted: false }, // Outdated tasks
      ],
    }).populate('userId', 'email lastNotificationSent');


    // Group tasks by user email
    const usersTasks = {};

    for (const note of notes) {
      try {

        // Fetch user based on the userId in the note
        const user = await User.findById(note.userId);
        if (user && user.email) {
          // Check if 24 hours have passed since last notification
          const lastNotification = new Date(note.lastNotificationSent);
          const diff = now - lastNotification; // difference in milliseconds
          const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

          if (diff >= oneDayInMs) {
            // If it's been 24 hours or more, send a notification
            if (!usersTasks[user.email]) {
              usersTasks[user.email] = [];
            }
            usersTasks[user.email].push(note);

            // Update outdated status
            if (note.endDate < new Date()) {
              note.outdated = true;
            }

            // Save the updated note
            await note.save();
          } else {
            console.log(`Skipping email for ${user.email} as the last notification was sent within 24 hours.`);
          }
        } else {
          console.warn(`No valid user found for task "${note.title}"`);
        }

      } catch (err) {
        console.error(`Error processing note "${note.title}":`, err.message);
      }
    }


    // Send one email per user with all their tasks
    for (const userEmail in usersTasks) {
    
      // Send notification email for all tasks of the user
      await sendNotification(userEmail, usersTasks[userEmail]);
    
      // Update lastNotificationSent for each note after sending the email
      for (const note of usersTasks[userEmail]) {
        try {
          // Update the lastNotificationSent field for the note
          await Note.updateOne(
            { _id: note._id },
            { lastNotificationSent: new Date() }
          );
        } catch (err) {
          console.error(`Error updating lastNotificationSent for task "${note.title}":`, err.message);
        }
      }
    }
    

    // Respond after all emails are sent
    console.log('All emails have been sent.');

  } catch (err) {
    console.error('Error during notification scheduling:', err.message);
  }
};


module.exports = startScheduler;
