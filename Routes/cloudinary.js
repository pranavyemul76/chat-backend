import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});
router.post(
  "/upload",
  express.static("uploads"),
  upload.single("file"),
  (req, res) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "auto" }, async (error, result) => {
        if (error) {
          res.status(500).json({ message: "Error uploading to Cloudinary" });
          console.error("Error uploading:", error);
        }

        try {
          res.status(200).json({ message: "upload success", url: result.url });
        } catch (error) {
          res.status(500).json({ message: "Error uploading to Cloudinary" });
        }
      })
      .end(req.file.buffer); // End the stream by passing the file buffer
  }
);
export default router;
