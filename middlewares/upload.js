const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = crypto.randomBytes(16).toString('hex') + ext;
        cb(null, uniqueName);
    }
});

const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (file.mimetype.startsWith('image/') && allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens permitidas'));
        }
    }
});

module.exports = upload;