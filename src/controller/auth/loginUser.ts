import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma/init";
import { compareHashedPassword, createJWT } from "../../middleware/auth";
import session from "express-session";
import { ISession } from "../../types";

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userName, password } = req.body;
    const formattedUserName = userName.toLowerCase();
    
    const user = await prisma.user.findUnique({
      where: { userName: formattedUserName },
      select: {
        password: true,
        id: true,
        emailIsVerified: true,
        email: true,
        name: true,
        verified: true,
        userName: true,
        followersCount: true,
        followingCount: true,
        imageUri: true,
      },
    });

    if (user && await compareHashedPassword(password, user.password)) {
      const token = createJWT({
        userName: formattedUserName,
        id: user.id,
        verified: user.emailIsVerified,
      });

      // Set token in session
      (req.session as any).token = token;

      res.status(200).json({
        token,
        data: {
          id: user.id,
          userName: formattedUserName,
          verified: user.emailIsVerified,
          email: user.email,
          name: user.name,
          imageUri: user.imageUri,
          emailIsVerified: user.emailIsVerified,
          followersCount: user.followersCount?.toString(),
          followingCount: user.followingCount?.toString(),
        },
        msg: "Login successful"
      });
    } else {
      res.status(401).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    next(error);
  }
}
