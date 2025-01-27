import { Request, Response } from "express";


export const logout = (req: any, res: Response) => {
  req.session.destroy();
  res.json({ msg: "done" });
};
