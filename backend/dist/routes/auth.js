"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = require("crypto");
const auth_1 = require("../auth");
const prisma_1 = require("../prisma");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/signup', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome?.trim())
        return res.status(400).json({ error: 'Informe seu nome.' });
    if (!email || !/\S+@\S+\.\S+/.test(email))
        return res.status(400).json({ error: 'E-mail inválido.' });
    if (!senha || senha.length < 6)
        return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres.' });
    const exists = await prisma_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) {
        return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
    }
    const user = await prisma_1.prisma.user.create({
        data: {
            nome: nome.trim(),
            email: email.toLowerCase(),
            passwordHash: (0, auth_1.hashPassword)(senha),
        },
    });
    const token = (0, auth_1.signToken)({ uid: user.id });
    return res.json({ ok: true, token, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
});
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email))
        return res.status(400).json({ error: 'E-mail inválido.' });
    const user = await prisma_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user)
        return res.status(404).json({ error: 'Conta não encontrada.' });
    if (!senha || !(0, auth_1.verifyPassword)(senha, user.passwordHash))
        return res.status(401).json({ error: 'Senha incorreta.' });
    const token = (0, auth_1.signToken)({ uid: user.id });
    return res.json({ ok: true, token, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
});
router.post('/logout', async (_req, res) => {
    // Com JWT, logout é client-side (descartar token)
    return res.json({ ok: true });
});
// Gera um token de acesso rápido de uso único e curta duração (ex.: 5 minutos)
router.post('/quick-token', auth_2.requireAuth, async (req, res) => {
    // @ts-ignore - middleware injeta req.userId
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ error: 'Não autenticado' });
    const token = (0, crypto_1.randomBytes)(24).toString('base64url');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    await prisma_1.prisma.quickToken.create({ data: { userId, token, expiresAt } });
    return res.json({ ok: true, token, expiresAt });
});
// Faz login trocando um quick-token válido por um JWT
router.post('/login/quick', async (req, res) => {
    const { token } = req.body;
    if (!token)
        return res.status(400).json({ error: 'Token ausente' });
    const record = await prisma_1.prisma.quickToken.findUnique({ where: { token } });
    if (!record)
        return res.status(404).json({ error: 'Token inválido' });
    if (record.used)
        return res.status(400).json({ error: 'Token já utilizado' });
    if (record.expiresAt.getTime() < Date.now())
        return res.status(400).json({ error: 'Token expirado' });
    const user = await prisma_1.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user)
        return res.status(404).json({ error: 'Usuário não encontrado' });
    await prisma_1.prisma.quickToken.update({ where: { token }, data: { used: true } });
    const jwt = (0, auth_1.signToken)({ uid: user.id });
    return res.json({ ok: true, token: jwt, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
});
exports.default = router;
//# sourceMappingURL=auth.js.map