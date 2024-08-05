import { Account } from "../models/account.model.js";
import { Frequency } from "../models/frequency.model.js";
import { Transaction } from "../models/transaction.model.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { addDaysToDate, notNull } from "../utils/validation.js";
import mongoose from 'mongoose';

const createTransaction = async (req, res) => {
    try {
        const { title, description, amount, type, category, accountId } = req.body

        if(!notNull(title) || !notNull(category) || !notNull(type) || !notNull(accountId)) {
            console.log("validate");
            return res.status(400).json(
                new apiError(400, "Please enter valid details")
            )
        }
        
        if(amount <= 0) {
            console.log("amount");
            return res.status(400).json(
                new apiError(400, "Transaction amount should be greater than zero")
            )
        }
        
        if(!(type === "Income" || type === "Expense")) {
            console.log("type");
            return res.status(400).json(
                new apiError(400, "Type should only be either income or expense")
            )
        }
        
        const transaction = await Transaction.create({
            title,
            description,
            amount,
            accountId,
            type,
            category,
            owner: req.user._id
        })
        
        if(!transaction) {
            console.log("trans");
            return res.status(500).json(
                new apiError(500, "Cannot save transaction, please try again")
            )
        }

        let responseString = "Transaction saved successfully"
        

        return res.status(200).json(
            new apiResponse(
                200,
                transaction,
                responseString
            )
        )

    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
}


const deleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body
        
        const session = await mongoose.startSession()

        session.startTransaction()
        try {
            
            const deletedTransaction = await Transaction.findByIdAndDelete(transactionId, { session })
            
            if(!deletedTransaction) {
                return res.status(500).json(
                    new apiError(500, "Transaction deletion failed")
                )
            }

            const account = await Account.findById(deletedTransaction.accountId)
            
            if(deletedTransaction.type === "Income") {
                account.balance -= deletedTransaction.amount;
            } else {
                account.balance += deletedTransaction;
            }

            const balUpdate = await account.save({validateBeforeSave: false }, { session })

            if(!balUpdate) {
                await session.abortTransaction();
                return res.status(500).json(
                    new apiError(500, "Transaction deletion failed")
                )
            }

            await session.commitTransaction()
            
        } catch (error) {
            await session.abortTransaction();
            return res.status(500).json(
                new apiError(error.code, error.message)
            )
        } finally {
            session.endSession()
        }


        return res.status(200).json(
            new apiResponse(
                200,
                {},
                "Transaction deletion successful"
            )
        )
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
}


const getTransactions = async(req, res) => {
    const { accountId } = req.body

    const transactions = await Transaction.find({
        owner: req.user._id,
        accountId: accountId
    })

    if(transactions.length <= 0) {
        return res.status(400).json(
            new apiError(400, "Invalid Account Id")
        )
    }
    
    return res.status(200).json(
        new apiResponse(
            200,
            transactions,
            "Transactions fetched"
        )
    )
}


const recurringTransaction = async (req, res) => {
    try {
        const { type, description, amount, accountId, renewPeriod, title, category } = req.body

        console.log(type, title, description, amount, accountId, renewPeriod, category)
        if(!notNull(category) || !notNull(title) || !notNull(accountId) || (renewPeriod <= 0) || (amount <= 0)) {
            return res.status(400).json(
                new apiError(400, "Provide appropriate values")
            )
        }

        if(!(type === "Income" || type == "Expense")) {
            return res.status(400).json(
                new apiError(400, "Provide appropriate type")
            )
        }
        
        // console.log(renewPeriod[renewPeriod.length - 1])
        const nextRenew = new Date(addDaysToDate(renewPeriod[renewPeriod.length - 1], parseInt(renewPeriod)))

        const recurring = await Frequency.create({
            title,
            description,
            amount,
            accountId,
            renewPeriod,
            isActive : true,
            nextRenew,
            type,
            category
        })

        if(!recurring) {
            return res.status(500).json(
                new apiError("Recurring transacation save failed")
            )
        }

        const addTransaction = await Transaction.create({
            owner: req.user._id,
            accountId,
            title,
            description,
            category,
            type,
            amount
        })

        if(!addTransaction) {
            await findByIdAndDelete(recurring._id)
            return res.status(500).json(
                new apiError(500, "Save failed, try again")
            )
        }

        return res.status(200).json(
            new apiResponse(
                201,
                recurring,
                "Recurring Transaction saved"
            )
        )
    } catch (error) {
        return res.status(error.code || 500).json({
            message: error.message,
            success: false
        })
    }
}


const pauseRecurring = async(req, res) => {
    try {
        const { recurringId } = req.body

        const pauseRecurring = await Frequency.findByIdAndUpdate(recurringId, {
            $set: {
                isActive: false,
            }
        })

        if(pauseRecurring.isActive === true) {
            return res.status(500).json(
                new apiError("Try again")
            )
        }

        return res.status(200).json(
            new apiResponse(
                200,
                {},
                "Paused Successfully"
            )
        )
    } catch (error) {
        return res.status(error.code || 500).json({
            message: error.message,
            success: false
        })
    }
}


const resumeRecurring = async(req, res) => {
    try {
        const { recurringId } = req.body

        const pauseRecurring = await Frequency.findByIdAndUpdate(recurringId, {
            $set: {
                isActive: true,
            }
        })

        if(pauseRecurring.isActive === false) {
            return res.status(500).json(
                new apiError("Try again")
            )
        }

        return res.status(200).json(
            new apiResponse(
                200,
                {},
                "Resumed Successfully"
            )
        )
    } catch (error) {
        return res.status(error.code || 500).json({
            message: error.message,
            success: false
        })
    }
}


const deleteRecurring = async(req, res) => {
    try {
        const { recurringId } = req.body

        const pauseRecurring = await Frequency.findByIdAndDelete(recurringId)

        if(!pauseRecurring) {
            return res.status(500).json(
                new apiError("Try again")
            )
        }

        return res.status(200).json(
            new apiResponse(
                200,
                {},
                "Deleted Successfully"
            )
        )
    } catch (error) {
        return res.status(error.code || 500).json({
            message: error.message,
            success: false
        })
    }
}


export {
    createTransaction, 
    deleteTransaction,
    recurringTransaction,
    pauseRecurring, 
    resumeRecurring,
    deleteRecurring,
    getTransactions
}