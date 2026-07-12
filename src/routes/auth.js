const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}
function isEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: 'E-mail inválido.' });
  if (typeof password !== 'string' || password.length < 8)
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 8 caracteres.' });
  if (typeof name !== 'string' || name.trim().length < 2)
    return res.status(400).json({ error: 'Informe seu nome.' });

  const normalizedEmail = email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email: normalizedEmail } }))
    return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email: normalizedEmail, name: name.trim(), password: hash } });
  res.status(201).json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = isEmail(email) ? await prisma.user.findUnique({ where: { email: email.toLowerCase() } }) : null;
  const ok = user && (await bcrypt.compare(String(password || ''), user.password));
  if (!ok) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
});

router.get('/me', authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true },
  });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user });
});

module.exports = router;
