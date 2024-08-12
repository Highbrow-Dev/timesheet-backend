const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const File = require("../models/File"); // Import the File model

const router = express.Router();

// Define storage for Multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a timestamp to the file name
  },
});

const upload = multer({ storage: storage });

// Route to handle file upload
router.post(
  "/upload-screenshot",
  upload.single("screenshot"),
  async (req, res) => {
    console.log("POST /api/upload-screenshot called");

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!req.body.email) {
      console.log("No email provided");
      return res.status(400).json({ error: "No email provided" });
    }

    const newFile = new File({
      filename: req.file.filename,
      path: req.file.path,
      userType: "employee", // Ensure only employees are allowed to upload
      email: req.body.email, // Store the email of the user
    });

    try {
      await newFile.save();
      console.log("File saved successfully:", newFile);
      res
        .status(201)
        .json({ message: "File uploaded successfully", file: newFile });
    } catch (error) {
      console.log("Error saving file:", error);
      res.status(500).json({ error: "Failed to save file" });
    }
  }
);

router.get("/screenshots", async (req, res) => {
  try {
    const files = await File.find({ userType: "employee" });
    res.status(200).json({ files });
  } catch (error) {
    console.log("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

module.exports = router;
