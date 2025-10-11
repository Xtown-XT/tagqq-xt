import multer from 'multer';

// Use memory storage
const storage = multer.memoryStorage();

// Multer config with 2MB file size limit
export const customerDocUpload = multer({
  storage,
  limits: {
    fileSize:  5 * 1024 * 1024 
  }
}).fields([
  {name: 'file_front', maxCount: 1 },
  {name: 'file_back', maxCount: 1 },
  {name: 'profile_image', maxCount: 1},
  {name: 'image', maxCount: 1},
  {name: 'selfi_image', maxCount: 1},
  {name: 'poster1', maxCount:1},
  {name: 'poster2', maxCount:1},
  {name: 'poster3', maxCount:1},
  {name: 'poster4', maxCount:1},
  {name: 'poster5', maxCount:1},
  {name: 'poster6', maxCount:1},
]);
