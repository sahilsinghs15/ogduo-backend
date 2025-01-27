//Changed the Aws to Cloudinary Logic
import { Response, Request, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { uploadVideo } from "../../../config/multer";

export const postVideo = [
  uploadVideo.single("video"), // Middleware to handle video upload
  async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      // Extract video URL from the file metadata
      const videoUrl = req.file.path;

      // Generate a thumbnail for the uploaded video
      const thumbnailUrl = cloudinary.url(req.file.filename, {
        resource_type: "video",
        format: "jpg",
        transformation: [
          { width: 300, height: 300, crop: "fill" }, // Example thumbnail transformation
          { start_offset: "50%" }, // Capture at 50% of the video's duration
        ],
      });

      // Respond with video and thumbnail URLs
      return res.status(200).json({
        video: videoUrl,
        thumbnail: thumbnailUrl,
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      next(error);
    }
  },
];
