const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const aiRoutes = require('./routes/aiRoutes');
const scheduleTaskNotification=require('./utils/MailHelper');
const cors = require('cors'); 
const mailschedulerRoute=require("./routes/mailschedulerRoute")
const AdminNoteRoutes=require("./routes/Admin/AdminNotes")
const AdminUserRoutes=require("./routes/Admin/Adminaccess")
const leetcodeRoute=require('./routes/leetcodeRoute')

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
}));

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
app.use('/api/adminnote', AdminNoteRoutes);
app.use("/api/adminuser",AdminUserRoutes);
app.use('/api/leetcode', leetcodeRoute);
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});


// scheduleTaskNotification();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
