import mongoose from "mongoose";
import { Account } from "./account.model.js";

const transactionSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: ["Income", "Expense"],
            required: true
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

transactionSchema.post("save", async function (doc) {
    const account = await Account.findById(this.accountId)
    if(this.type === "Income") {
        account.balance += this.amount;
    } else {
        account.balance -= this.amount
    }
    await account.save({
        validateBeforeSave: false,
    });
});


export const Transaction = mongoose.model("Transaction", transactionSchema);
