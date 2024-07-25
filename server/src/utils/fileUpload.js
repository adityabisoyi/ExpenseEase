import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_SECRET,
  api_secret: process.env.CLOUDINARY_API_ACCESS_KEY,
});

const uploadFile = async (filePath) => {
  const uploadResult = await cloudinary.uploader
    .upload(filePath, {
      public_id: Date.now(),
    })
    .catch((error) => {
      console.log("FIle upload failed : ", error);
    });

  console.log(uploadResult);
};


export { uploadFile }