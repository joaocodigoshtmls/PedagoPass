"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
function hashPassword(input) {
    return crypto_1.default.createHash('sha256').update(input).digest('hex');
}
function verifyPassword(input, hash) {
    return hashPassword(input) === hash;
}
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, { expiresIn: '30d' });
}
function verifyToken(token) {
    try {
        const data = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        return data;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=auth.js.map