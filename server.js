// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== MongoDB Connection =====
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/visitorDB";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Import Routes =====
const visitorRoutes = require("./routes/VisitorRoutes"); // adjust file name if different

// ===== Use Routes =====
app.use("/api", visitorRoutes);

// ===== Default Route =====
app.get("/", (req, res) => {
  res.send("🚀 Visitor Tracking API is running...");
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
