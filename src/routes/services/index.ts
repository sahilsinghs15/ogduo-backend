//Changes made : - Added new routes for postPhotoUpload and profilePhotoUpload and Corrected the multer functions import to work with Cloudinary's upload middleware
import { Router } from "express";
import { handleErrors } from "./../../middleware/validation/handleErrors";
import {
  createPostValidator,
  followValidator,
  followerFollowingValidator,
  getCommentValidator,
  getPostsValidator,
  likeValidator,
  postCommentValidator,
  searchValidator,
} from "./../../middleware/validation/inputValidation";
import config from "../../config/env";
import { uploadAudio, uploadProfileImage,uploadPostImage, uploadVideo } from "../../config/multer"; // Import only `upload` for Cloudinary integration
import { getAllPosts } from "../../controller/services/posts/getAllPosts";
import { postContent } from "../../controller/services/posts/postContent";
import { getRandomPosts } from "../../controller/services/posts/getRandomPosts";
import { postAudio } from "../../controller/services/posts/postAudio";
// import { postPhoto } from "../../controller/services/posts/postPhoto";
import { postVideo } from "../../controller/services/posts/postVideo";
import { followUser } from "../../controller/services/follow/followUser";
import { searchForPosts } from "../../controller/services/posts/searchForPosts";
import { getRandomFollowers } from "../../controller/services/follow/getRandomPeople";
import { searchPeople } from "../../controller/services/follow/searchPeople";
import { unfollowUser } from "../../controller/services/follow/unfollowUser";
import { like } from "../../controller/services/posts/likePost";
import { postComment } from "../../controller/services/posts/postComment";
import { getCommentByPost } from "../../controller/services/posts/getCommentsByPost";
import { getPostByFollowing } from "../../controller/services/posts/getPostByFollowing";
import { getMyPosts } from "../../controller/services/posts/getMyPosts";
import { getGuestPosts } from "../../controller/services/posts/getGuestPosts";
import { rePost } from "../../controller/services/posts/rePost";
import { getSinglePost } from "../../controller/services/posts/getSinglePost";
import { deletePostById } from "../../controller/services/posts/deletePostbyId";
import { profilePhotoUpload } from "../../modules/handlePhotoUpload/profilePhotoUpload";
import { postPhotoUpload } from "../../modules/handlePhotoUpload/postPhotoUpload";

const router = Router();

// Define whether the environment is production
const isProduction = config.stage === "production";

// Routes for posts
router.post("/post", createPostValidator, handleErrors, postContent);
router.get("/all-posts", getPostsValidator, handleErrors, getAllPosts);
router.get("/random-posts", getRandomPosts);
router.get("/random-people", getRandomFollowers);
router.get("/search-posts", searchValidator, handleErrors, searchForPosts);
router.get("/search-people", searchValidator, handleErrors, searchPeople);

// Cloudinary-based photo upload
router.post("/upload-photo", uploadProfileImage.single("photo"), profilePhotoUpload);
router.post("/upload-post-photo", uploadPostImage.single("photo"), postPhotoUpload);

// Video upload (remaining with existing logic)
router.post(
  "/upload-video",
  isProduction ? uploadVideo.single("video") : uploadVideo.single("video"),
  postVideo
);

// Audio upload (remaining with existing logic)
router.post(
  "/upload-audio",
  isProduction ? uploadAudio.single("audio") : uploadAudio.single("audio"),
  postAudio
);

// Routes for user actions
router.get("/follow", followValidator, handleErrors, followUser);
router.get("/unfollow", followValidator, handleErrors, unfollowUser);
router.get("/like-post", likeValidator, handleErrors, like);
router.post("/post-comment", postCommentValidator, handleErrors, postComment);
router.get(
  "/get-postComment",
  getCommentValidator,
  handleErrors,
  getCommentByPost
);
router.get(
  "/followed-posts",
  getPostsValidator,
  handleErrors,
  getPostByFollowing
);
router.get("/my-posts", getPostsValidator, handleErrors, getMyPosts);
router.get("/single-post", getSinglePost);
router.get("/guest-posts", getPostsValidator, handleErrors, getGuestPosts);
router.get("/re-post", followerFollowingValidator, handleErrors, rePost);
router.delete("/delete-post", deletePostById);

export default router;
