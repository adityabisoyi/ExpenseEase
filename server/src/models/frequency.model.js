import mongoose, { mongo } from "mongoose";

const frequencySchema = mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account"
        },
        renewPeriod: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        category: {
            type: String,
            required: true,
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