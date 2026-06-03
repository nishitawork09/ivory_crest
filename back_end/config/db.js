const mongoose = require("mongoose");
const startReminderScheduler = require("../utils/reminderScheduler");
const PORT = process.env.PORT || 5000; 

const connectDB = (app) => {
  mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ivorycrest", {
      maxPoolSize: 100,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log("MongoDB Connected");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        startReminderScheduler();
      });
    })
    .catch((err) => console.log(err));
};

module.exports = connectDB;