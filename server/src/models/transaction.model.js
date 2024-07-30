import mongoose from "mongoose";
import { Account } from "./account.model";

const transactionSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        type: {
            type: String,
            enum: ["Income", "Expense"],
            required: true
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        category: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

transactionSchema.post("save", async function(next) {
    if(!this.isModified("amount")) return next();

    const account = await Account.findbyId(this.accountId)

    account.balance += this.amount;
    await account.save({
        validateBeforeSave: false,
    })

    next()
})

export const Transaction = mongoose.model("Transaction", transactionSchema);
