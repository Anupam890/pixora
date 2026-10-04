import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "eq0syso9",
  api_key: process.env.CLOUDINARY_API_KEY || "674641919132827",
  api_secret: process.env.CLOUDINARY_API_SECRET || "5rr7dLd62Xg6QpSMVRMYNbKvJ20",
  secure: true,
});

export { cloudinary };

export async function uploadImageToCloudinary(
  fileBufferOrBase64: string | Buffer,
  folder = "pixora/prompts"
): Promise<{
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}> {
  return new Promise((resolve, reject) => {
    if (typeof fileBufferOrBase64 === "string") {
      cloudinary.uploader.upload(
        fileBufferOrBase64,
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );
    } else {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary stream upload failed"));
          }
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );
      uploadStream.end(fileBufferOrBase64);
    }
  });
}
