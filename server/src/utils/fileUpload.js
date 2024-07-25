import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_SECRET,
    api_secret: process.env.CLOUDINARY_API_ACCESS_KEY,
});

const uploadFile = async (filePath) => {
    if (!filePath) return null;

    const uploadResult = await cloudinary.uploader
        .upload(filePath, {
            resource_type: "auto",
        })
        .catch((error) => {
            console.log("FIle upload failed : ", error);
            fs.unlinkSync(filePath);
            return null;
        });

    fs.unlinkSync(filePath);
    console.log("File is uploaded : ", uploadResult);
    return uploadResult;
};

export { uploadFile };
