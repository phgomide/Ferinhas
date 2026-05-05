const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/db');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
    db.all(`
    SELECT u.id, u.username, u.role, p.friend_group 
    FROM users u 
    LEFT JOIN padrinhos p ON u.id = p.user_id 
    ORDER BY u.id DESC
  `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro interno' });
        res.json(rows);
    });
});

router.delete('/:id', requireAdmin, (req, res) => {
    const targetId = parseInt(req.params.id);
    if (targetId === req.session.userId) {
        return res.status(400).json({ error: 'Não é possível deletar a si mesmo' });
    }
    db.serialize(() => {
        db.run(`DELETE FROM padrinhos WHERE user_id = ?`, [targetId]);
        db.run(`DELETE FROM users WHERE id = ?`, [targetId], function (err) {
            if (err) return res.status(500).json({ error: 'Erro interno' });
            res.json({ success: true });
        });
    });
});

router.patch('/:id/role', requireAdmin, (req, res) => {
    const targetId = parseInt(req.params.id);
    if (targetId === req.session.userId) {
        return res.status(400).json({ error: 'Você não pode alterar seu próprio papel' });
    }
    const { role } = req.body;
    if (!['candidato', 'padrinho', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Papel inválido' });
    }
    db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, targetId], function (err) {
        if (err) return res.status(500).json({ error: 'Erro interno' });
        res.json({ success: true });
    });
});

router.patch('/:id/group', requireAdmin, (req, res) => {
    const targetId = parseInt(req.params.id);
    const { group } = req.body;
    if (group !== null && !['Undergrounds', 'Girlgroup'].includes(group)) {
        return res.status(400).json({ error: 'Grupo inválido' });
    }
    db.run(`UPDATE padrinhos SET friend_group = ? WHERE user_id = ?`, [group, targetId], function (err) {
        if (err) return res.status(500).json({ error: 'Erro interno' });
        res.json({ success: true });
    });
});

router.post('/:id/reset-password', requireAdmin, async (req, res) => {
    const targetId = parseInt(req.params.id);
    const newPassword = crypto.randomBytes(8).toString('hex');
    const hash = await bcrypt.hash(newPassword, 10);
    db.run(`UPDATE users SET password = ? WHERE id = ?`, [hash, targetId], function (err) {
        if (err) return res.status(500).json({ error: 'Erro interno' });
        res.json({ success: true, newPassword });
    });
});

module.exports = router;