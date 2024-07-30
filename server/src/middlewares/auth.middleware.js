import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res
                .status(404)
                .json(new apiError(404, "Authorization error"));
        }

        const decodedToken = await jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshtoken"
        );

        if (!user) {
            return res.status(400).json(new apiError(400, "No user found"));
        }
        
        req.user = user;

        next();

    } catch (error) {
        return res
            .status(error.code || 500)
            .json({
                success: false,
                message: error.message
            });
    }
};


export { verifyJWT }