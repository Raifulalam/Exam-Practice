const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");


dotenv.config();

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());
app.get('/', (req, res) => {
    console.log("Success");
    res.send("Server is running successfully!");
});
const protectedRoutes = require("./routes/protected");
app.use("/api", protectedRoutes);

// ✅ Correct way to use router
app.use("/api/auth", authRoutes);

const practiceRoutes = require("./routes/practice");
app.use('/practice', practiceRoutes)
app.use("/api/practice-sets", require("./routes/practiceSet"));

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));

app.listen(5000, () => console.log("Server running on port 5000"));
