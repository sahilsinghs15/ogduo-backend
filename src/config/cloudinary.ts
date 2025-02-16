import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (buffer: Buffer): Promise<{ secure_url?: string }> => {
  try {
    // Convert buffer to base64
    const b64 = buffer.toString('base64');
    const dataURI = `data:image/jpeg;base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'posts'
    });

    return { secure_url: result.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {};
  }
};
