import { User } from "../models/user.model.js"
import { notNull, validateEmail, validatePassword } from "../utils/validation.js"
import { apiError } from "../utils/apiError.js"
import { uploadFile } from "../utils/fileUpload.js"
import { apiResponse } from "../utils/apiResponse.js"
import fs from "fs"


const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId)
    const refreshToken = user.generateRefreshToken()
    const accessToken = user.generateAccessToken()

    user.refreshToken = refreshToken
    user.save({
        validateBeforeSave: false
    })

    return { refreshToken, accessToken }
}


const registerUser = async (req, res) => {
    try {
        // get data
        const {fullname, email, password} = req.body;


        //Validaate data
        if(!notNull(fullname) || !validateEmail(email) || !validatePassword(password)) {
            return res.status(400).json(
                new apiError(400, "Fill valid details !!!")
            )
        }
        
        let avatarLocalPath;

        if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path
        }
        

        //search for exiting user
        const userExists = await User.findOne({email: email})
        
        if(userExists) {
            fs.unlinkSync(avatarLocalPath)
            return res.status(400).json(
                new apiError(409, "Email already exists !!!")
            )
        }
        

        //handle files
        if(!avatarLocalPath) {
            console.log("avatar error");
            return res.status(409).json(
                new apiError(409, "Please provide avatar image !!!")
            )
        }
        

        //upload to cloudinary
        const avatar = await uploadFile(avatarLocalPath)


        //upload on db
        const user = await User.create ({
            fullname: fullname,
            password: password, 
            email: email.toLowerCase(), 
            avatar: avatar.url
        })


        //generate and return response
        const createdUser = await User.findById(user._id).select("-password -refreshToken")

        return res.status(200).json(
            new apiResponse(201, createdUser, "User created")
        )

    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}


const loginUser = async(req, res) => {
    try {
        //get credentials
        const {email, password} = req.body


        //validate them
        if(!validateEmail(email)) {
            return res.status(400).json(
                new apiError(400, "Invalid email !!!")
            )
        }


        //check credentials
        const user = await User.findOne({email})
        if(!loginUser) {
            console.log("login error")
            return res.status(404).json(
                new apiError(404, "No user with this email exists !!!")
            )
        }

        const isPasswordValid = await user.isPasswordCorrect(password)
        if(!isPasswordValid) {
            return res.status(401).json(
                apiError(401, "Invalid credentials !!!")
            )
        }


        //generate access and refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)


        //send details in response
        const options = {
            httpOnly: true,
            secure: true
        }

        delete user.password
        delete user.refreshToken

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
                    refreshToken
                },
                "User logged in successfully !!!"
            )
        )

    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}

export { registerUser, loginUser }