const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads", "auctions");

fs.mkdirSync(uploadDir, {
    recursive: true
});

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        const safeExt = path.extname(file.originalname).toLowerCase();
        callback(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`
        );
    }
});

const fileFilter = (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
        callback(new Error("Only image files are allowed"));
        return;
    }

    callback(null, true);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
