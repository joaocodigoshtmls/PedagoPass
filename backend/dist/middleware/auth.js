"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const auth_1 = require("../auth");
function requireAuth(req, res, next) {
    const auth = req.header('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token)
        return res.status(401).json({ error: 'Não autenticado' });
    const data = (0, auth_1.verifyToken)(token);
    if (!data)
        return res.status(401).json({ error: 'Token inválido' });
    req.userId = data.uid;
    next();
}
//# sourceMappingURL=auth.js.map