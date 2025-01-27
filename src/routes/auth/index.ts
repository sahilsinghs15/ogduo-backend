import { Router } from "express";

import {
  loginValidation,
  signupValidation,
} from "../../middleware/validation/inputValidation";
import { createUser } from "../../controller/auth/createUser";
import { loginUser } from "../../controller/auth/loginUser";
import { handleErrors } from "../../middleware/validation/handleErrors";
const router = Router();

router.get('/',(req,res)=>{
    res.send('ok')
})
router.post("/login", loginValidation, handleErrors, loginUser as any) ;
router.post("/signup", signupValidation, handleErrors, createUser as any);

export default router;
