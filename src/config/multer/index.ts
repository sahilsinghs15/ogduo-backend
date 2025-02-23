//Changed the Aws to Cloudinary Logic
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v4 as uuid } from "uuid";
import path from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/profileImages",
    format: async (req : any, file:any) => path.extname(file.originalname).substring(1),
    public_id: (req:any, file:any) => uuid(),
  } as any, // Temporary fix for TypeScript error
});

const postImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/postImages",
    format: async (req : any, file:any) => path.extname(file.originalname).substring(1),
    public_id: (req:any, file:any) => uuid(),
  } as any, // Temporary fix for TypeScript error
});


// Cloudinary storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/videos",
    resource_type: "video",
    format: async () => "mp4", // Ensures MP4 format
    public_id: (req:any, file:any) => uuid(),
  },
}as any);

// Cloudinary storage for audio
const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/audio",
    resource_type: "raw", // Audio files
    format: async (req:any, file:any) => path.extname(file.originalname).substring(1),
    public_id: (req:any, file:any) => uuid(),
  },
} as any);

// File filters
const fileFilter = (req:any, file:any, cb:any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."));
  }
};

const fileFilterVideo = (req:any, file:any, cb:any) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only video files are supported."));
  }
};

const fileFilterAudio = (req:any, file:any, cb:any) => {
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only audio files are supported."));
  }
};

// Multer configurations
export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16 MB
  fileFilter,
});

export const uploadPostImage = multer({
  storage: postImageStorage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16 MB
  fileFilter,
});

export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: fileFilterVideo,
});

export const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16 MB
  fileFilter: fileFilterAudio,
});
