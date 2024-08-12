const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const uploadRoutes = require("./routes/uploadRoutes"); // Import the upload routes

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api", uploadRoutes); // Mount the upload routes under /api

const PORT = process.env.PORT || 5001; // Ensure this matches your setup
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
