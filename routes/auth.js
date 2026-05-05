const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { authLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

router.post('/register', authLimiter, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string' || username.length < 3 || password.length < 6 || username.length > 50 || password.length > 100) {
        return res.status(400).json({ error: 'Dados inválidos' });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function (err) {
            if (err) return res.status(400).json({ error: 'Usuário já existe' });
            req.session.regenerate((err) => {
                if (err) return res.status(500).json({ error: 'Erro interno' });
                req.session.userId = this.lastID;
                req.session.username = username;
                req.session.role = 'candidato';
                res.json({ success: true, username, role: 'candidato' });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno' });
    }
});

router.post('/login', authLimiter, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Dados inválidos' });
    }
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Credenciais inválidas' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });

        req.session.regenerate((err) => {
            if (err) return res.status(500).json({ error: 'Erro interno' });
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.role = user.role;
            res.json({ username: user.username, role: user.role, userId: user.id });
        });
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('sessionId');
    res.json({ success: true });
});

router.get('/session', (req, res) => {
    if (req.session.userId) {
        res.json({ username: req.session.username, role: req.session.role, userId: req.session.userId });
    } else {
        res.status(401).json({ error: 'Não logado' });
    }
});

module.exports = router;