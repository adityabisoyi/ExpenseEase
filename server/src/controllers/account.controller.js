import { Account } from "../models/account.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { convertAccountNumber } from "../utils/validation.js"

const createAccount = async (req, res) => {
    try {
        const { accountNumber } = req.body
        
        const accExists = await Account.findOne({
            accountNumber: convertAccountNumber(accountNumber)
        })

        if(accExists) {
            return res.status(401).json(
                new apiError(401, "Account number already exists")
            )
        }
        
        const account = await Account.create({
            accountNumber: convertAccountNumber(accountNumber),
            owner: req.user._id
        })
        

        return res
        .status(201)
        .json(
            new apiResponse(
                201,
                account,
                "Account added successfully"
            )
        )

    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        })
    }
}


const getAccountInfo = async (req, res) => {
    try {
        // console.log(req.cookies?.account)
        const { accountId } =req.body

        // console.log(accountNumber)
        const account = await Account.findOne({
            _id: accountId,
            owner: req.user._id
        })

        if(!account) {
            return res.status(401).json(
                new apiError(401, "No accounts found")
            )
        }

        // console.log(account);
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                account,
                "Account details fetched successfully"
            )
        )

    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        })
    }
}


const getAllUserAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({
            owner: req.user._id
        })

        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                accounts,
                "All accounts for the user fetched"
            )
        )
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        })
    }
}


export { 
    createAccount,
    getAccountInfo,
    getAllUserAccounts 
}