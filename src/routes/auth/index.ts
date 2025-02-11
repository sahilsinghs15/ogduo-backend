import { Router } from "express";

import {
  loginValidation,
  signupValidation,
} from "../../middleware/validation/inputValidation";
import { createUser } from "../../controller/auth/createUser";
import { loginUser } from "../../controller/auth/loginUser";
import { handleErrors } from "../../middleware/validation/handleErrors";
import { verifyToken } from "../../middleware/auth/index";

const router = Router();

router.get('/',(req,res)=>{
    res.send('ok')
})
router.post("/login", loginValidation, handleErrors, loginUser as any) ;
router.post("/signup", signupValidation, handleErrors, createUser as any);
router.get("/validate", verifyToken, (req, res) => {
  try {
    res.json({ 
      tokenValid: true,
      tokenError: null,
      user: req.user,
      authenticated: true
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({
      tokenValid: false,
      tokenError: 'Invalid token',
      user: null,
      authenticated: false
    });
  }
});

export default router;
