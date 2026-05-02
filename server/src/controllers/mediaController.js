import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { generateUploadSignature } from "../services/mediaService.js";
import AppError from "../utils/AppError.js";

// @desc    Get Cloudinary upload signature
// @route   POST /api/v1/media/upload
// @access  Private
export const getUploadSignature = asyncHandler(async (req, res) => {
  const { type } = req.body || {};

  // Require type to be specified
  if (!type) {
    throw new AppError('Upload type is required', 400);
  }

  // Validate upload type
  const allowedTypes = ['avatar', 'cover', 'post', 'story', 'message'];
  
  if (!allowedTypes.includes(type)) {
    throw new AppError(`Invalid upload type. Allowed: ${allowedTypes.join(', ')}`, 400);
  }

  // Build folder path based on type and username
  const username = req.user.username;
  let folder;

  switch(type) {
    case 'avatar':
      folder = 'koottam/avatars';
      break;
    case 'cover':
      folder = 'koottam/covers';
      break;
    case 'post':
      folder = `koottam/posts/${username}`;
      break;
    case 'story':
      folder = `koottam/stories/${username}`;
      break;
    case 'message':
      folder = `koottam/messages/${username}`;
      break;
  }

  const data = generateUploadSignature({ folder });

  return successResponse(res, 200, "Upload signature generated successfully", data);
});
