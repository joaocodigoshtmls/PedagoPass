import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';
export function hashPassword(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}
export function verifyPassword(input, hash) {
    return hashPassword(input) === hash;
}
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}
export function verifyToken(token) {
    try {
        const data = jwt.verify(token, JWT_SECRET);
        return data;
    }
    catch {
        return null;
    }
}
