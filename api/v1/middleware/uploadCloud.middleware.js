const multer = require("multer");
const cloudinary = require("../../../config/cloud.config");
const streamifier = require("streamifier");

const upload = multer().single('avatar'); // 'avatar' is the field name in the form

const uploadCloudMiddleware = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send({ error: err.message });
        }

        // Check if there is a file uploaded
        if (req.file) {
            console.log(req.file.fieldname); // Safely access fieldname

            const streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    });
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            try {
                const result = await streamUpload(req);
                req.body[req.file.fieldname] = result.url; // Set the uploaded image URL in the request body
            } catch (error) {
                return res.status(500).send({ error: 'Failed to upload to Cloudinary: ' + error });
            }
        } else {
            // Handle case where there is no file uploaded
            console.log('No file uploaded, proceeding with the request body:', req.body);
        }

        // Proceed to the next middleware or route handler
        next();
    });
};

module.exports = uploadCloudMiddleware;
