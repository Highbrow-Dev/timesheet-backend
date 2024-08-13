const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");

const router = express.Router();

let gfs;
mongoose.connection.once("open", () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: Date.now() + "-" + file.originalname,
      bucketName: "uploads",
    };
  },
});

const upload = multer({ storage });

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

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        id: req.file.id,
      },
    });
  }
);

// Route to get all uploaded files
router.get("/screenshots", async (req, res) => {
  gfs.files.find({}).toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        message: "No files found",
      });
    }

    return res.status(200).json(files);
  });
});

// Route to retrieve a file by filename
router.get("/screenshots/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ error: "No file found" });
    }

    // If the file exists, create a read stream and pipe it to the response
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});

module.exports = router;
