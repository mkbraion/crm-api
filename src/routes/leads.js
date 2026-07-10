const express = require('express');
const prisma = require('../prisma');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired); // tudo aqui exige login

function sanitize(body) {
  return {
    nome: String(body?.nome ?? '').trim().slice(0, 120),
    fone: String(body?.fone ?? '').trim().slice(0, 40),
    valor: Math.max(0, Math.floor(Number(body?.valor) || 0)),
    origem: String(body?.origem ?? '').trim().slice(0, 60),
    obs: String(body?.obs ?? '').trim().slice(0, 2000),
    stage: Math.min(3, Math.max(0, Math.floor(Number(body?.stage) || 0))),
    lost: Boolean(body?.lost),
  };
}

// Garante que o lead existe E pertence ao usuário logado (evita IDOR).
async function ownedLead(userId, id) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  return lead && lead.userId === userId ? lead : null;
}

// GET /api/leads
router.get('/', async (req, res) => {
  const leads = await prisma.lead.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } });
  res.json({ leads });
});

// POST /api/leads
router.post('/', async (req, res) => {
  const data = sanitize(req.body);
  if (!data.nome) return res.status(400).json({ error: 'Informe o nome do lead.' });
  const lead = await prisma.lead.create({ data: { ...data, userId: req.userId } });
  res.status(201).json({ lead });
});

// PUT /api/leads/:id
router.put('/:id', async (req, res) => {
  const existing = await ownedLead(req.userId, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead não encontrado.' });
  const data = sanitize({ ...existing, ...req.body });
  if (!data.nome) return res.status(400).json({ error: 'Informe o nome do lead.' });
  const lead = await prisma.lead.update({ where: { id: req.params.id }, data });
  res.json({ lead });
});

// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
  const existing = await ownedLead(req.userId, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead não encontrado.' });
  await prisma.lead.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
