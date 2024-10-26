
const handleError = (res, error, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: error.message || "Internal Server Error",
    });
};

module.exports = handleError;
