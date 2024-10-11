const multer = require("multer");
const cloudinary = require("../../../config/cloud.config");
const streamifier = require("streamifier");

const upload = multer().single('img'); // 'img' là tên field trong form, mặc định multer lưu vào trong memory storage

const uploadCloudMiddleware = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send({ error: err.message });
        }

        if (req.file) {
            let streamUpload = (req) => {
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
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            try {
                let result = await streamUpload(req);
                req.body.img = result.url; 
                next();
            } catch (error) {
                return res.status(500).send({ error: 'Failed to upload to Cloudinary' });
            }
        } else {
            next();
        }
    });
};

module.exports = uploadCloudMiddleware;
