const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const aiRoutes = require('./routes/aiRoutes');
const scheduleTaskNotification=require('./utils/MailHelper')
const mailschedulerRoute=require("./routes/mailschedulerRoute")

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error: ', err));
  const now = new Date();
  // console.log("now",now);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mail', mailschedulerRoute);

scheduleTaskNotification();


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
