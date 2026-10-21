import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_UPLOAD_DIMENSION = 1400;

export async function uploadDataImage(dataUrl: string): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not configured.");
  }

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: "bijoya/photos",
    resource_type: "image",
    transformation: [
      {
        width: MAX_UPLOAD_DIMENSION,
        height: MAX_UPLOAD_DIMENSION,
        crop: "limit",
      },
    ],
  });

  return result.secure_url;
}
