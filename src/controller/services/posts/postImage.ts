import { NextFunction, Response, Request } from "express";
import prisma from "../../../lib/prisma/init";
import { handleNotificationsForPosts } from "../../../modules/handleNotifications/forPosts";
import sharp from "sharp";
import { uploadImageToCloudinary} from "../../../config/cloudinary";

// Helper function to handle post notifications
async function handlePostNotifications(userId: string, postId: string, postText: string) {
  const signedInUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      userName: true,
      imageUri: true,
      followers: {
        where: { notificationId: { not: null } },
        select: { notificationId: true, id: true }
      }
    }
  });

  if (signedInUser?.followers?.length) {
    await handleNotificationsForPosts(
      postText || "New Image Post",
      userId,
      signedInUser.imageUri || "",
      signedInUser.followers,
      postId
    );
  }
}

export const postImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req?.user as { id: string };
    const { postText } = req.body;
    const photo = req.file;

    console.log('Received request:', {
      body: req.body,
      file: req.file
    });

    if (!photo) {
      res.status(400).json({
        errors: [{
          type: 'field',
          value: undefined,
          msg: 'Image file is required',
          path: 'photo',
          location: 'body'
        }]
      });
      return;
    }

    // Process image with sharp
    const image = sharp(photo.buffer);
    const metadata = await image.metadata();

    // Upload to Cloudinary
    const uploadResult = await uploadImageToCloudinary(photo.buffer);
    
    if (!uploadResult.secure_url) {
      res.status(500).json({
        errors: [{
          type: 'server',
          msg: 'Failed to upload image',
          location: 'server'
        }]
      });
      return;
    }

    // Create post with image
    const post = await prisma.post.create({
      data: {
        user: { connect: { id } },
        postText,
        photo: {
          create: {
            imageUri: uploadResult.secure_url,
            imageHeight: metadata.height || 0,
            imageWidth: metadata.width || 0
          }
        }
      }
    });

    await handlePostNotifications(id, post.id, postText);

    res.status(200).json({
      msg: "posted",
      photo: {
        uri: uploadResult.secure_url,
        height: metadata.height,
        width: metadata.width
      }
    });
  } catch (error) {
    console.error("Image post error:", error);
    res.status(500).json({
      errors: [{
        type: 'server',
        msg: 'Failed to process image post',
        location: 'server'
      }]
    });
  }
};
