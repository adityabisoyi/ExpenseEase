import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { 
    createTransaction, 
    deleteRecurring, 
    deleteTransaction, 
    getTransactions, 
    pauseRecurring, 
    recurringTransaction, 
    resumeRecurring 
} from "../controllers/transaction.controller.js";


const router = Router()

router.route("/add").post(verifyJWT, createTransaction)

router.route("/get").post(verifyJWT, getTransactions)

router.route("/add-recurring").post(verifyJWT, recurringTransaction)

router.route("/pause-recurring").post(verifyJWT, pauseRecurring)

router.route("/resume-recurring").post(verifyJWT, resumeRecurring)

router.route("/delete-recurring").post(verifyJWT, deleteRecurring)

router.route("/delete").post(verifyJWT, deleteTransaction)

export default router;