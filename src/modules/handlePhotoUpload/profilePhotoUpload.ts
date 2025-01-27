//Changed the Aws to Cloudinary Logic
import { NextFunction, Request, Response } from "express";
import { uploadProfileImage } from "../../config/multer"; // Import Cloudinary's upload configuration
import sharp from "sharp";

export const profilePhotoUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const photo = req.file;

    if (!photo) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    if (photo.mimetype === "image/gif") {
      // Resize animated GIF using Sharp
      const processedBuffer = await sharp(photo.buffer, { animated: true })
        .gif()
        .resize(300, 300)
        .toBuffer();

      // Replace photo's buffer with the processed buffer
      if(req.file)  req.file.buffer = processedBuffer;
    } else {
      // Resize JPEG/PNG images
      const processedBuffer = await sharp(photo.buffer)
        .jpeg({ quality: 90 })
        .resize(600, 600)
        .toBuffer();

      // Replace photo's buffer with the processed buffer
      if(req.file)  req.file.buffer = processedBuffer;
    }

    // Use Cloudinary's upload middleware
    uploadProfileImage.single("file")(req , res, async (err: any) => {
      if (err) {
        return res.status(500).json({ message: "Image upload failed.", error: err });
      }

      // Access the uploaded file's Cloudinary URL
      if (req.file && req.file.path) {
        req.imageUri = req.file.path ;
      }

      next();
    });
  } catch (error) {
    console.error("Error processing the profile photo:", error);
    res.status(500).json({ message: "Error processing the profile photo.", error });
  }
};
