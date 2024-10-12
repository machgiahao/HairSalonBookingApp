const multer = require("multer");
const cloudinary = require("../../../config/cloud.config");
const streamifier = require("streamifier");

const upload = multer().fields([
    { name: 'img', maxCount: 1 },
    { name: 'avatar', maxCount: 1 }
]);

const uploadCloudMiddleware = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            console.log(err)
            return res.status(400).send({ error: err.message });
        }

        // Check if file have 'img' or 'avatar' field
        const fileField = req.files?.img ? 'img' : req.files?.avatar ? 'avatar' : null;

        if (fileField) {
            const file = req.files[fileField][0]; // Lấy file đầu tiên từ trường img hoặc avatar

            let streamUpload = (file) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream( 
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });
            };

            try {
                let result = await streamUpload(file);
                req.body[fileField] = result.url; 
                next();
            } catch (error) {
                console.log(error)
                return res.status(500).send({ error: 'Failed to upload to Cloudinary' });
            }
        } else {
            next();
        }
    });
};

module.exports = uploadCloudMiddleware;
