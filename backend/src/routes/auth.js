const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSetting, updateSettings } = require('../utils/db');

const SALT_ROUNDS = 12;

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error('JWT_SECRET missing or too short (min 16 chars)');
  return s;
}

router.post('/login', async (req, res, next) => {
  try {
    const { senha } = req.body;
    if (!senha || typeof senha !== 'string') {
      return res.status(400).json({ success: false, error: 'Senha obrigatória', code: 'PASSWORD_REQUIRED' });
    }

    const senhaHash = await getSetting('senha_hash');
    const isFirstLogin = !senhaHash;

    if (isFirstLogin) {
      const hash = await bcrypt.hash(senha, SALT_ROUNDS);
      await updateSettings({ senha_hash: hash });
    } else {
      const ok = await bcrypt.compare(senha, senhaHash);
      if (!ok) return res.status(401).json({ success: false, error: 'Senha incorreta', code: 'INVALID_PASSWORD' });
    }

    const expiry = process.env.JWT_EXPIRY || '7d';
    const token = jwt.sign({ role: 'admin' }, secret(), { expiresIn: expiry });
    const decoded = jwt.decode(token);

    res.json({ success: true, data: { token, expiresAt: new Date(decoded.exp * 1000).toISOString(), firstLogin: isFirstLogin } });
  } catch (err) { next(err); }
});

router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.json({ success: true, data: { authenticated: false } });
  try {
    const payload = jwt.verify(header.slice(7), secret());
    res.json({ success: true, data: { authenticated: true, expiresAt: new Date(payload.exp * 1000).toISOString() } });
  } catch {
    res.json({ success: true, data: { authenticated: false } });
  }
});

module.exports = router;
