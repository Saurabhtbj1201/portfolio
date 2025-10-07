import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Debug: Log environment variables (remove in production)
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✓' : '✗',
  api_key: process.env.CLOUDINARY_API_KEY ? '✓' : '✗',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✓' : '✗'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify Cloudinary connection
export const verifyCloudinaryConnection = async () => {
  try {
    // Check if credentials are present
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials are missing in environment variables');
    }

    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary Connected:', result.status);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary Connection Failed:', error.message);
    console.error('Please check your Cloudinary credentials in .env file');
    return false;
  }
};

export default cloudinary;
