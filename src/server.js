require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('\n[ERRO] Defina um JWT_SECRET forte no .env (copie de .env.example).\n');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '200kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos.' },
});

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'crm-api' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/leads', leadRoutes);

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => console.log(`\n📊 CRM API rodando em http://localhost:${PORT}\n`));
