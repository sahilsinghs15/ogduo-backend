import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

// Extend JwtPayload to include the id property
interface CustomJwtPayload extends JwtPayload {
  id: string;
}

interface JwtPayloadWithUser extends JwtPayload {
  id: string;
  userName: string;
  verified: boolean;
}

// Middleware to verify token
const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ valid: false, message: "No token provided" });
    return;
  }

  jwt.verify(token, process.env.SECRET as string, (err, decoded) => {
    if (err || typeof decoded !== 'object' || !decoded) {
      res.status(401).json({ valid: false, message: "Invalid token" });
      return;
    }

    const { id } = decoded as CustomJwtPayload;
    if (!id) {
      res.status(401).json({ valid: false, message: "Invalid token structure" });
      return;
    }

    req.user = decoded as CustomJwtPayload;
    next();
  });
};

// Function to compare hashed passwords
const compareHashedPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Function to create JWT
const createJWT = (payload: JwtPayloadWithUser): string => {
  return jwt.sign(payload, process.env.SECRET as string, { expiresIn: '30d' });
};

// Middleware to block JWT
const blockJWT = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers["authorization"];
  
  if (!token) {
    res.status(403).json({ message: "Access denied. No token provided." });
    return;
  }

  next();
};

// Middleware to protect routes
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401).json({ 
      tokenValid: false,
      message: "No token provided",
      authenticated: false
    });
    return;
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    res.status(401).json({ 
      tokenValid: false,
      message: "Invalid token format",
      authenticated: false
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET as string);
    req.user = decoded as CustomJwtPayload;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      tokenValid: false,
      message: "Token expired or invalid",
      authenticated: false
    });
  }
};

// Function to create hashed password
const createHashedPassword = async (plainPassword: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
};

// Function to create email JWT
const createEmailJWT = (email: string): string => {
  return jwt.sign({ email }, process.env.SECRET || "", { expiresIn: "1h" });
};

// Middleware to check if user is verified
const checkVerified = async (req: any, res: Response, next: NextFunction) => {
  const { verified } = req.user;
  if (verified) {
    next();
  } else {
    return res.status(401).json({ msg: "User not verified" });
  }
};

// Export all functions and middlewares
export {
  blockJWT,
  verifyToken,
  compareHashedPassword,
  createJWT,
  createHashedPassword,
  createEmailJWT,
  checkVerified
};
