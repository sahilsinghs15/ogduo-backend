import { NextFunction, Response, Request } from "express";
import prisma from "../../../lib/prisma/init";
import validator from "validator";
import ogs from "open-graph-scraper";
import { handleNotificationsForPosts } from "../../../modules/handleNotifications/forPosts";

export const postContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req?.user as { id: string };
    const {
      postText,
      audioUri,
      videoUri,
      videoTitle
    } = req.body;

    // Handle URL posts (for text posts that contain URLs)
    if (validator.isURL(postText)) {
      try {
        const { result } = await ogs({ url: postText });
        const ogImage = result?.ogImage?.length ? result.ogImage[0] : undefined;
        
        const post = await prisma.post.create({
          data: {
            user: { connect: { id } },
            postText,
            link: {
              create: {
                imageHeight: ogImage?.height ? Number(ogImage.height) : undefined,
                imageWidth: ogImage?.width ? Number(ogImage.width) : undefined,
                imageUri: ogImage?.url,
                url: postText,
                title: result?.ogTitle
              }
            }
          }
        });

        await handlePostNotifications(id, post.id, postText);
        res.status(200).json({ msg: "posted" });
        return;
      } catch (error) {
        console.error("OG scraping error:", error);
      }
    }

    // Helper function to ensure URLs have http/https
    const ensureHttpUrl = (url?: string) => {
      if (!url) return undefined;
      return url.startsWith("http") ? url : `https://${url}`;
    };

    // Handle audio/video/text posts
    try {
      const post = await prisma.post.create({
        data: {
          user: { connect: { id } },
          postText,
          ...(audioUri && {
            audioUri: ensureHttpUrl(audioUri),
              }),
          ...(videoUri && {
            videoUri: ensureHttpUrl(videoUri),
            videoTitle
          })
        }
      });

      await handlePostNotifications(id, post.id, postText);
      res.status(200).json({ msg: "posted" });
      return;
    } catch (error) {
      console.error("Post creation error:", error);
      res.status(500).json({ 
        errors: [{ 
          type: 'server',
          msg: 'Failed to create post',
          location: 'server'
        }]
      });
      return;
    }
  } catch (error) {
    console.error("General error:", error);
    next(error);
  }
};

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
      postText || "New Media content",
      userId,
      signedInUser.imageUri || "",
      signedInUser.followers,
      postId
    );
  }
}
