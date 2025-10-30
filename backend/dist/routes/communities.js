import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prisma';
const router = Router();
// Lista todas as comunidades com detalhes
router.get('/', async (_req, res) => {
    const list = await prisma.community.findMany({ orderBy: { nome: 'asc' } });
    // Converte CSV de tags em array
    const communities = list.map((c) => ({
        slug: c.slug,
        nome: c.nome,
        descricao: c.descricao,
        membros: c.membros,
        tags: c.tags ? c.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        capa: c.capa ?? undefined,
    }));
    return res.json({ communities });
});
// Detalhe de uma comunidade
router.get('/:slug', async (req, res) => {
    const slug = String(req.params.slug);
    const c = await prisma.community.findUnique({ where: { slug } });
    if (!c)
        return res.status(404).json({ error: 'Comunidade não encontrada' });
    const community = {
        slug: c.slug,
        nome: c.nome,
        descricao: c.descricao,
        membros: c.membros,
        tags: c.tags ? c.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        capa: c.capa ?? undefined,
    };
    return res.json({ community });
});
router.post('/:slug/join', requireAuth, async (req, res) => {
    const slug = String(req.params.slug);
    await prisma.communityMembership.upsert({
        where: { userId_slug: { userId: req.userId, slug } },
        update: {},
        create: { userId: req.userId, slug },
    });
    return res.json({ ok: true });
});
router.delete('/:slug/join', requireAuth, async (req, res) => {
    const slug = String(req.params.slug);
    await prisma.communityMembership.deleteMany({ where: { userId: req.userId, slug } });
    return res.json({ ok: true });
});
export default router;
