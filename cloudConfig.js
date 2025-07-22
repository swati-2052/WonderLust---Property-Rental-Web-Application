const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// ✅ Define storage settings for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Wonderlust_DEV",                    // 🗂️ Folder name in Cloudinary
    allowed_formats: ["jpeg", "jpg", "png"]  // ✅ Correct key spelling
  }
});

module.exports = { cloudinary, storage };
