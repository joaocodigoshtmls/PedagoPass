import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/me', requireAuth, async (req, res) => {
    const list = await prisma.order.findMany({
        where: { userId: req.userId },
        orderBy: { pagoEm: 'desc' },
    });
    return res.json({ orders: list });
});
router.get('/:id', requireAuth, async (req, res) => {
    const o = await prisma.order.findUnique({ where: { id: String(req.params.id) } });
    if (!o || o.userId !== req.userId)
        return res.status(404).json({ error: 'Compra não encontrada' });
    return res.json({ order: o });
});
router.get('/by-reservation/:reservationId', requireAuth, async (req, res) => {
    const { reservationId } = req.params;
    const o = await prisma.order.findFirst({ where: { reservationId, userId: req.userId }, orderBy: { pagoEm: 'desc' } });
    if (!o)
        return res.status(404).json({ error: 'Compra não encontrada' });
    return res.json({ order: o });
});
router.post('/mark-paid', requireAuth, async (req, res) => {
    const { reservationId, metodo, parcelas } = req.body;
    if (!reservationId || !metodo)
        return res.status(400).json({ error: 'Parâmetros inválidos' });
    const r = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!r || r.userId !== req.userId)
        return res.status(404).json({ error: 'Reserva não encontrada' });
    const order = await prisma.order.create({
        data: {
            userId: r.userId,
            reservationId: r.id,
            destinoSlug: r.destinoSlug,
            destinoNome: r.destinoNome,
            total: r.totalEstimado,
            metodo,
            parcelas: parcelas ?? null,
        },
    });
    await prisma.reservation.update({ where: { id: r.id }, data: { status: 'confirmada' } });
    return res.json({ ok: true, order });
});
export default router;
