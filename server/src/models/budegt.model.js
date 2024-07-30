import mongoose, { mongo } from "mongoose";

const budgetItemSchema = mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
        },
        limit: {
            type: Number,
            required: true,
        },
        expended: {
            type: Number,
            required: true,
            default: 0
        }
    }
)

const budgetSchema = mongoose.Schema(
    {
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        budgets: {
            type: [budgetItemSchema]
        }
    },
    {
        timestamps: true,
    }
);

export const Budget = mongoose.model("Budget", budgetSchema)