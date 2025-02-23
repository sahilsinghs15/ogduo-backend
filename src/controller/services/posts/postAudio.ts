import { Response, Request, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { uploadAudio } from "../../../config/multer";
import prisma from "../../../lib/prisma/init";

export const postAudio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No audio file provided" });
      return;
    }

    const { postText } = req.body;
    const userId = (req as any).user.id;

    // Upload audio to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto", // Automatically detect the file type
      folder: "uploads/audio",
    });

    // Create a new post using Prisma
    const newPost = await prisma.post.create({
      data: {
        userId,
        postText,
        audioUri: result.secure_url,
      },
      include: {
        user: true,
      },
    });

    res.status(201).json({
      message: "Audio posted successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error uploading audio:", error);
    next(error);
  }
};
