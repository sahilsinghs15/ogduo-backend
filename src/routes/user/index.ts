import { NextFunction, Response, Router } from "express";
import prisma from "../../lib/prisma/init";
import { getUser } from "../../controller/user/getUser";
import { getFollows } from "../../controller/user/getFollows";
import config from "../../config/env";
import { uploadProfileImage } from "../../config/multer";
import { updatePhoto } from "../../controller/user/updatePhoto";
import { getGuest } from "../../controller/user/getGuest";
import { saveNotificationId } from "../../controller/user/saveNotificationId";
import { getNotifications } from "../../controller/user/getNotifications";
import { profilePhotoUpload } from "../../modules/handlePhotoUpload/profilePhotoUpload";
import { getFollowersList } from "../../controller/services/follow/getFollowersList";
import { getFollowingList } from "../../controller/services/follow/getFollowingList";
import { handleErrors } from "../../middleware/validation/handleErrors";
import {
  deleteAccountValidator,
  followerFollowingValidator,
  updateDataValidator,
} from "../../middleware/validation/inputValidation";
import { changeData } from "../../controller/user/changeData";
import { logout } from "../../controller/user/logout";
import { deleteAccount } from "../../controller/user/deleteAccount";

const isProduction = config.stage === "production";
const router = Router();
router.get("/get-user", getUser as any);
router.get("/get-guest", getGuest as any);
router.get("/get-follows", getFollows);
router.get("/token-valid", (req: any, res: Response, next: NextFunction) => {
  res.json({ msg: true });
});
router.get("/get-notifications", getNotifications as any);
// router.post(
//   "/update-photo",

//   isProduction && uploadOcean
//     ? uploadOcean.single("photo")
//     : upload.single("photo"),

//   updatePhoto
// );

router.post(
  "/update-photo",
  uploadProfileImage.single("photo"),
  profilePhotoUpload as any,
  updatePhoto as any
);
router.put("/update-notification-id", saveNotificationId as any);
router.get(
  "/get-following",
  followerFollowingValidator,
  handleErrors,
  getFollowingList as any
);
router.get(
  "/get-followers",
  followerFollowingValidator,
  handleErrors,
  getFollowersList as any
);
router.get("/logout", logout);
router.put("/update-data", updateDataValidator, handleErrors, changeData as any);
router.delete("/delete-account", deleteAccountValidator, handleErrors, deleteAccount as any);
export default router;
