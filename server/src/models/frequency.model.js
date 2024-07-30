import mongoose, { mongo } from "mongoose";

const frequencySchema = mongoose.Schema(
    {
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
        },
        renewPeriod: {
            type: Number,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        nextRenew: {
            type: Date,
            required: true,
        },
        type: {
            type: String,
            enum: ["Income", "Expense"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Frequency = mongoose.model("Frequency", frequencySchema)