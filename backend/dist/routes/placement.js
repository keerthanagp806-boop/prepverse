"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const store_1 = require("../db/store");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get Placement Readiness metrics, category percentages & recommended next steps
router.get('/readiness', auth_1.authenticate, (req, res) => {
    const readiness = store_1.store.getPlacementReadiness(req.user.id);
    res.json(readiness);
});
exports.default = router;
