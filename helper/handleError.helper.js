
const handleError = (res, statusCode = 500, error) => {
    return res.status(statusCode).json({
        success: false,
        error: error.message || "Internal Server Error",
    });
};

module.exports = handleError;
