import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImageToCloudinary = async (buffer: Buffer): Promise<{ secure_url?: string }> => {
  try {
    // Convert buffer to base64
    const b64 = buffer.toString('base64');
    const dataURI = `data:image/jpeg;base64,${b64}`;//**This is hardcoded for jped type of image i have to make it dynamic in future

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'postsImage'
    });

    return { secure_url: result.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {};
  }
};

export const uploadVideoToCloudinary = async (file: Express.Multer.File): Promise<{ secure_url?: string }> => {
  try {
    if (!file || !file.buffer) {
      throw new Error('No file provided');
    }

    // Create a temporary file path for the video
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'postsVideo',
          allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'mp4' }
          ]
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            reject(error || new Error('Upload failed'));
            return;
          }
          resolve(result);
        }
      );

      // Handle potential stream errors
      uploadStream.on('error', (error) => {
        console.error('Stream upload error:', error);
        reject(error);
      });

      uploadStream.end(file.buffer);
    });

    return { secure_url: result.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error; // Let the controller handle the error
  }
};
