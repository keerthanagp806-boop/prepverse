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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const auth_1 = __importDefault(require("./routes/auth"));
const courses_1 = __importDefault(require("./routes/courses"));
const assessments_1 = __importDefault(require("./routes/assessments"));
const coding_1 = __importDefault(require("./routes/coding"));
const companies_1 = __importDefault(require("./routes/companies"));
const placement_1 = __importDefault(require("./routes/placement"));
const admin_1 = __importDefault(require("./routes/admin"));
const upload_1 = __importDefault(require("./routes/upload"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static uploaded files (videos, images, PDFs)
app.use('/uploads', express_1.default.static(uploadDir));
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'PrepVerse API Engine',
        timestamp: new Date().toISOString()
    });
});
// Route Endpoints
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/courses', courses_1.default);
app.use('/api/v1/assessments', assessments_1.default);
app.use('/api/v1/coding', coding_1.default);
app.use('/api/v1/companies', companies_1.default);
app.use('/api/v1/placement', placement_1.default);
app.use('/api/v1/admin', admin_1.default);
app.use('/api/v1/upload', upload_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PrepVerse Backend Server running on http://localhost:${PORT}`);
});
