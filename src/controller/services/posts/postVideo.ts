//Changed the Aws to Cloudinary Logic
import { Response, Request, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { uploadVideo } from "../../../config/multer";
import { uploadVideoToCloudinary } from "../../../config/cloudinary";
import prisma from "../../../lib/prisma/init";
import { createSerializedResponse } from "../../../utils/serialization";

export const postVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json(createSerializedResponse(
        null,
        "No video file provided or invalid file format",
        400
      ));
      return;
    }

    const { postText, videoTitle } = req.body;
    const userId = (req as any).user.id;

    try {
      // Upload video to Cloudinary
      const uploadResult = await uploadVideoToCloudinary(req.file);
      
      if (!uploadResult.secure_url) {
        res.status(500).json(createSerializedResponse(
          null,
          "Failed to upload video to Cloudinary",
          500
        ));
        return;
      }

      // Create a new post using Prisma
      const newPost = await prisma.post.create({
        data: {
          userId,
          postText,
          videoTitle,
          videoUri: uploadResult.secure_url,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              userName: true,
              imageUri: true,
            }
          },
        },
      });

      res.status(201).json(createSerializedResponse(
        { post: newPost },
        "Video posted successfully",
        201
      ));
    } catch (uploadError) {
      console.error("Error uploading to Cloudinary:", uploadError);
      res.status(500).json(createSerializedResponse(
        { error: uploadError instanceof Error ? uploadError.message : 'Unknown error occurred' },
        "Failed to upload video to Cloudinary",
        500
      ));
    }
  } catch (error) {
    console.error("Error in postVideo:", error);
    next(error);
  }
};
