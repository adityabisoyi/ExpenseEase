import { User } from "../models/user.model.js";
import {
    notNull,
    validateEmail,
    validatePassword,
} from "../utils/validation.js";
import { apiError } from "../utils/apiError.js";
import { 
    uploadFile, 
    deleteFile 
} from "../utils/uploadFile.js";
import { apiResponse } from "../utils/apiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({
        validateBeforeSave: false,
    });

    return { refreshToken, accessToken };
};


const registerUser = async (req, res) => {
    try {
        // get data
        const { fullname, email, password } = req.body;

        //Validaate data
        if (
            !notNull(fullname) ||
            !validateEmail(email) ||
            !validatePassword(password)
        ) {
            return res
                .status(400)
                .json(new apiError(400, "Fill valid details !!!"));
        }

        let avatarLocalPath;

        if (
            req.files &&
            Array.isArray(req.files.avatar) &&
            req.files.avatar.length > 0
        ) {
            avatarLocalPath = req.files.avatar[0].path;
        }

        //search for exiting user
        const userExists = await User.findOne({ email: email });

        if (userExists) {
            fs.unlinkSync(avatarLocalPath);
            return res
                .status(400)
                .json(new apiError(409, "Email already exists !!!"));
        }

        //handle files
        if (!avatarLocalPath) {
            console.log("avatar error");
            return res
                .status(409)
                .json(new apiError(409, "Please provide avatar image !!!"));
        }

        //upload to cloudinary
        const avatar = await uploadFile(avatarLocalPath);

        //upload on db
        const user = await User.create({
            fullname: fullname,
            password: password,
            email: email.toLowerCase(),
            avatar: avatar.url,
        });

        //generate and return response
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        return res
            .status(200)
            .json(new apiResponse(201, createdUser, "User created"));
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
};


const loginUser = async (req, res) => {
    try {
        //get credentials
        const { email, password } = req.body;

        //validate them
        if (!validateEmail(email)) {
            return res.status(400).json(new apiError(400, "Invalid email !!!"));
        }

        //check credentials
        const user = await User.findOne({ email });
        if (!loginUser) {
            console.log("login error");
            return res
                .status(404)
                .json(new apiError(404, "No user with this email exists !!!"));
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json(new apiError(401, "Invalid credentials !!!"));
        }

        //generate access and refresh token
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        //send details in response
        const options = {
            httpOnly: true,
            secure: true,
        };

        delete user.password;
        delete user.refreshToken;

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {
                        user: user,
                        accessToken,
                        refreshToken,
                    },
                    "User logged in successfully !!!"
                )
            );
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
};


const logoutUser = async (req, res) => {
    try {
        //remove refresh token
        await User.findByIdAndUpdate(
            req.user._id, 
            {
                $unset: {refreshToken: 1}
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(200, {}, "User logged out successfully")
        )
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
    
};


const renewAccessToken = async(req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken) {
            return res.status(401).json(
                new apiError(401, "Unauthorized token")
            )
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
                "Access token renewes successfully"
            )
        )

    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
}


const updatePassword = async (req, res) => {
    try {
        //get details
        const {currentPassword, confirmPassword, newPassword} = req.body


        //validate data
        if(newPassword !== confirmPassword) {
            return res.status(400).json(
                new apiError(400, "Passwords don't match")
            )
        }

        if(!validatePassword(currentPassword)) {
            return res.status(400).json(
                new apiError(400, "New password is not valid")
            )
        }

        //check in the db
        const user = await User.findById(req.user._id)
        const isPasswordValid = await user.isPasswordCorrect(currentPassword)

        if(!isPasswordValid) {
            return res.status(409).json(
                new apiError(409, "Old password is incorrect")
            )
        }


        //update passowrd
        user.password = newPassword
        await user.save({
            validateBeforeSave: false
        })

        return res.status(202).json(
            new apiResponse(202, {}, "Password is updated")
        )

    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
}


const getUser = async(req, res) => {
    try {
        return res.status(200).json(
            new apiResponse(
                200,
                req.user,
                "User data"
            )
        )
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
}


const updateAvatar = async (req, res) => {
    try {
        // console.log(req.file)
        const avatarPath = req.file?.path
    
        if(!avatarPath) {
            return res.status(400).json(
                new apiError(400, "Please upload image")
            )
        }    

        const avatar = await uploadFile(avatarPath)

        if(!avatar) {
            return res.status(500).json(
                new apiError(500, "Upload failed please try again")
            )
        }

        const getOldAvatar = await User.findById(req.user._id)

        const deleteResponse = await deleteFile(getOldAvatar.avatar)

        if(!deleteResponse) {
            return res.status(500).json(
                new apiError(500, "Profle deletion failed deletion failed")
            )
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    avatar: avatar.url
                }
            },
            {new: true}
        ).select("-password")

        return res.status(200).json(
            new apiResponse(
                200, 
                user, 
                "Profile photo updated successfully"
            )
        )

    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
    
}


export { 
    registerUser, 
    loginUser, 
    logoutUser,
    renewAccessToken, 
    updatePassword,
    getUser,
    updateAvatar
};

