"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// ─── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Videos
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
    // Documents / PDFs
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Text / Code (for notes & exercises)
    'text/plain', 'text/markdown',
]);
// NEVER allow these — executables, scripts, archives that could contain malware
const BLOCKED_EXTENSIONS = new Set([
    '.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi', '.dll', '.so', '.dylib',
    '.vbs', '.js', '.ts', '.py', '.rb', '.php', '.zip', '.tar', '.gz', '.rar',
]);
const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (BLOCKED_EXTENSIONS.has(ext)) {
        return cb(new Error(`File type "${ext}" is not allowed for security reasons.`));
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return cb(new Error(`MIME type "${file.mimetype}" is not permitted. Please upload an image, video, PDF, or Office document.`));
    }
    cb(null, true);
};
// Configure multer disk storage with UUID filenames
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `${(0, uuid_1.v4)()}${ext}`;
        cb(null, safeName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB max for videos / large PDFs
    }
});
// ─── Single file upload endpoint ──────────────────────────────────────────────
router.post('/', auth_1.authenticate, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded. Please select a file to upload.' });
            return;
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        const mime = req.file.mimetype;
        const fileType = mime.startsWith('video/') ? 'video' :
            mime.startsWith('image/') ? 'image' :
                mime === 'application/pdf' ? 'pdf' :
                    'document';
        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                sizeBytes: req.file.size,
                mimetype: mime,
                type: fileType,
                url: fileUrl
            }
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'File upload failed. Please try again.' });
    }
});
// Handle multer-specific errors (file too large, bad type)
router.use((err, _req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(413).json({ error: 'File is too large. Maximum allowed size is 100 MB.' });
            return;
        }
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
    }
    if (err) {
        res.status(400).json({ error: err.message || 'File upload failed.' });
        return;
    }
    next();
});
exports.default = router;
