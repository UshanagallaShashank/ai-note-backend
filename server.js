const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
<<<<<<< HEAD
const aiRoutes = require('./routes/aiRoutes');
const notificationScheduler=require('./services/notificationScheduler')
const mailschedulerRoute=require("./routes/mailschedulerRoute")
=======
>>>>>>> 916248d22c2765a5b2f4498bcda2872a765fc383

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

<<<<<<< HEAD

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error: ', err));
  const now = new Date();
  console.log("now",now);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mail', mailschedulerRoute);




=======
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error: ', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

>>>>>>> 916248d22c2765a5b2f4498bcda2872a765fc383
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
