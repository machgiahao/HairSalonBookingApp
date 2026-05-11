const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the 'uploads' directory exists
const uploadDir = './upload';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Define storage options for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder to 'uploads' directory
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique file name to avoid conflicts
    cb(null, Date.now() + path.extname(file.originalname));  // Adds timestamp to the file name
  }
});

// File filter function to allow only certain file types
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const fileTypes = /jpeg|jpg|png|img/;
  
  // Check the file extension
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check the MIME type
  const mimeType = fileTypes.test(file.mimetype);

  if (extname && mimeType) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Only .jpeg, .jpg, .png, .img files are allowed!'), false);  // Reject the file
  }
};

// Setup multer with storage and file filter configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
