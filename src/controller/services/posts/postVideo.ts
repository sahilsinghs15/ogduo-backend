//Changed the Aws to Cloudinary Logic
import { Response, Request, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { uploadVideo } from "../../../config/multer";
import prisma from "../../../lib/prisma/init";

export const postVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No video file provided" });
      return;
    }

    const { postText, videoTitle } = req.body;
    const userId = (req as any).user.id;

    // Upload video to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "uploads/videos",
    });

    // Create a new post using Prisma
    const newPost = await prisma.post.create({
      data: {
        userId,
        postText,
        videoTitle,
        videoUri: result.secure_url,
        videoThumbnail: cloudinary.url(result.public_id, {
          resource_type: "video",
          format: "jpg",
          transformation: [
            { width: 300, height: 300, crop: "fill" },
            { start_offset: "0" },
          ],
        }),
      },
      include: {
        user: true,
      },
    });

    res.status(201).json({
      message: "Video posted successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    next(error);
  }
};
