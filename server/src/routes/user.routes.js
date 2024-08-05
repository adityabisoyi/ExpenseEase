import { Router } from "express"
import { 
    getUser, 
    loginUser, 
    logoutUser, 
    registerUser, 
    renewAccessToken, 
    updateAvatar, 
    updatePassword 
} from "../controllers/user.controller.js"
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


//unprotected routes
router.route("/login").post(loginUser)
router.route("/renew-token").post(renewAccessToken)


//protected routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/change-password").patch(verifyJWT, updatePassword)
router.route("/get-user").get(verifyJWT, getUser)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)


export default router;