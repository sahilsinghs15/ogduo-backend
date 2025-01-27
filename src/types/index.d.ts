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

import { Session } from "express-session";

export interface ISession extends Session {
  token: string;
}

import { Request } from "express";
declare global {
  namespace Express {
    export interface Request {
      file?: {
        path?: string;
        buffer?: Buffer;
        mimetype?: string;
      };
      imageUri?: string;
      user?: {
        id: string;
      };
    }
  }
}

