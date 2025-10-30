import { verifyToken } from '../auth';
export function requireAuth(req, res, next) {
    const auth = req.header('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token)
        return res.status(401).json({ error: 'Não autenticado' });
    const data = verifyToken(token);
    if (!data)
        return res.status(401).json({ error: 'Token inválido' });
    req.userId = data.uid;
    next();
}
