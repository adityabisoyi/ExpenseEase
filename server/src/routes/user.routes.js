import { Router } from "express"
import { loginUser, logoutUser, registerUser, renewAccessToken, updatePassword } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/renew-token").post(renewAccessToken)


//protected routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/change-password").patch(verifyJWT, updatePassword)



export default router;