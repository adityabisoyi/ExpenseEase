import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { error } from "console";

dotenv.config({
    path: "./.env",
});


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (filePath) => {
    if (!filePath) return null;

    const uploadResult = await cloudinary.uploader
        .upload(filePath, {
            resource_type: "auto",
        })
        .catch((error) => {
            console.log("File upload failed : ", error);
            fs.unlinkSync(filePath);
            return null;
        });

    fs.unlinkSync(filePath);
    return uploadResult;
};

const deleteFile = async(fileUrl) => {
    if(!fileUrl) return null;

    const parts = fileUrl.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];

    await cloudinary.uploader
        .destroy(publicId)
        .catch((error) => {
            console.log("File deletion failed : ", error)
            return null;
        })

    return true;
}

export { uploadFile, deleteFile };
