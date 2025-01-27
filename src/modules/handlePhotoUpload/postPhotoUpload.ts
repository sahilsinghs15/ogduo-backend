//Changed the Aws to Cloudinary Logic
import { NextFunction, Request, Response } from "express";
import imageSize from "image-size";
import sharp from "sharp";
import { uploadPostImage } from "../../config/multer"; // Import Cloudinary's upload configuration

export const postPhotoUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const photo = req.file;

    if (!photo) {
      return res.status(400).json({ msg: "No file uploaded." });
    }

    // Resize image (optional, based on requirements)
    const processedBuffer = await sharp(photo.buffer)
      .jpeg({ quality: 90 })
      .toBuffer();

    // Replace the file's buffer with the resized image
    if (req.file) req.file.buffer = processedBuffer;

    // Use Cloudinary's upload middleware
    uploadPostImage.single("file")(req, res, async (err: any) => {
      if (err) {
        return res.status(500).json({ msg: "Image upload failed.", error: err });
      }

      // Access uploaded file's URL from Cloudinary
      if (req.file && req.file.path) {
        const dimensions = imageSize(req.file.buffer); // Get dimensions from processed buffer

        if (!dimensions) {
          return res.status(500).json({ msg: "Unable to determine image dimensions." });
        }

        const image = {
          uri: req.file.path, // Cloudinary image URL
          width: dimensions.width,
          height: dimensions.height,
        };

        console.log("Uploaded Image Details:", image);

        // Respond with the image details
        return res.status(200).json({ photo: image });
      }

      return res.status(500).json({ msg: "Image upload failed." });
    });
  } catch (error) {
    console.error("Error processing the post photo:", error);
    res.status(500).json({ msg: "Error processing the post photo.", error });
  }
};
