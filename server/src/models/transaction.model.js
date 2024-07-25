import mongoose from "mongoose";

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
        accountNumber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        type: {
            type: String,
            enum: ["Recurring", "One-time"],
            required: true,
            default: "One-time",
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

export const Transaction = mongoose.model("Transaction", transactionSchema);
