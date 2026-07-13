import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export function getCloudinaryUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}): string {
  const { width, height, quality = 80, format = "webp" } = options ?? {};
  const transforms: string[] = [`f_${format}`, `q_${quality}`];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`, "c_fill");
  return cloudinary.url(publicId, { transformation: transforms.join(",") });
}
