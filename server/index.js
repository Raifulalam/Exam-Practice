const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  console.log("Success");
  res.send("Server is running successfully!");
});

// Route imports
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const practiceRoutes = require("./routes/practice");
const gameRoutes = require("./routes/gameRoutes");
const adminRoutes = require("./routes/admin");

// Route uses
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use('/practice', practiceRoutes);
app.use("/api/practice-sets", require("./routes/practiceSet"));
app.use("/api", require("./routes/score"));
app.use("/api/cee", require("./routes/ceeScoreRoutes"));
app.use("/api/games", gameRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Connect to MongoDB first, then start the server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
