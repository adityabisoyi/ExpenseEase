import { User } from "../models/user.model.js"
import { notNull, validateEmail, validatePassword } from "../utils/validation.js"
import { apiError } from "../utils/apiError.js"
import { uploadFile } from "../utils/fileUpload.js"
import { apiResponse } from "../utils/apiResponse.js"
import fs from "fs"


const registerUser = async (req, res) => {
    // get data
    const {fullname, email, password} = req.body;

    //Validaate data
    if(!notNull(fullname) || !validateEmail(email) || !validatePassword(password)) {
        // console.log("validation error");
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
        // console.log("exist error");
        fs.unlinkSync(avatarLocalPath)
        return res.status(409).json(
            new apiError(409, "email already exits !!!")
        )
    }
    
    //handle files
    
    if(!avatarLocalPath) {
        // console.log("avatar error");
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

}

export { registerUser }