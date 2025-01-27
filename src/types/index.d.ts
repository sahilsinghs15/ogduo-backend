import "multer-storage-cloudinary";

declare module "multer-storage-cloudinary" {
  interface CloudinaryStorageOptions {
    cloudinary: any;
    params?: {
      folder?: string;
      format?: string | ((req: any, file: any) => string | Promise<string>);
      public_id?: string | ((req: any, file: any) => string | Promise<string>);
    };
  }

  class CloudinaryStorage {
    constructor(options: CloudinaryStorageOptions);
  }
}
declare module "express-serve-static-core" {
  interface Request {
    imageUri?: string;
  }
}
