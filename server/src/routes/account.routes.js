import { Router } from "express"
import { 
    createAccount, 
    getAccountInfo, 
    getAllUserAccounts 
} from "../controllers/account.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// protected routes
router.route("/create").post(verifyJWT, createAccount)
router.route("/get").post(verifyJWT, getAccountInfo)
router.route("/get-all").get(verifyJWT, getAllUserAccounts)


export default router;