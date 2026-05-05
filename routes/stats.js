const express = require('express');
const db = require('../config/db');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
    const today = new Date().toISOString().slice(0, 10) + '%';
    db.get(`SELECT COUNT(*) as total FROM candidaturas`, [], (err, rowTotal) => {
        if (err) return res.status(500).json({ error: 'Erro no banco de dados' });
        db.get(`SELECT COUNT(*) as today FROM candidaturas WHERE criado_em LIKE ?`, [today], (err, rowToday) => {
            if (err) return res.status(500).json({ error: 'Erro no banco de dados' });
            db.get(`SELECT COUNT(*) as random FROM candidaturas WHERE padrinho_escolhido = 'TANTO_FAZ'`, [], (err, rowRandom) => {
                if (err) return res.status(500).json({ error: 'Erro no banco de dados' });
                res.json({
                    total: rowTotal.total,
                    today: rowToday.today,
                    random: rowRandom.random
                });
            });
        });
    });
});

module.exports = router;