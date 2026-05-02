import crypto from 'crypto';
import { 
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET 
} from '../config/env.js';
import AppError from '../utils/AppError.js';

export const generateUploadSignature = ({ folder = 'uploads', resourceType = 'image' }) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary configuration is missing', 500);
  }

  const timestamp = Math.round(Date.now() / 1000);
  
  // Parameters to sign
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  
  // Generate signature using SHA-1
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + CLOUDINARY_API_SECRET)
    .digest('hex');

  // Only return signature and timestamp
  // Frontend should have api_key and cloud_name in its own .env
  return {
    signature,
    timestamp,
    folder
  };
};

export const validateCloudinaryUrl = (url) => {
  if (!url) {
    throw new AppError('URL is required', 400);
  }

  // Check if URL is from Cloudinary
  const cloudinaryPattern = /^https?:\/\/res\.cloudinary\.com\//;
  
  if (!cloudinaryPattern.test(url)) {
    throw new AppError('Invalid Cloudinary URL', 400);
  }

  return true;
};
