const express = require('express');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.post('/', requireAuth, (req, res) => {
    const { nome, sobre, padrinho } = req.body;
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ error: 'Nome obrigatório' });
    }
    const padrinhoFinal = (typeof padrinho === 'string' && padrinho.trim() !== '') ? padrinho : 'TANTO_FAZ';
    const data = new Date().toISOString();

    db.run(
        `INSERT INTO candidaturas (nome_usuario, sobre_usuario, padrinho_escolhido, usuario_login, criado_em) VALUES (?, ?, ?, ?, ?)`, [nome, sobre || '', padrinhoFinal, req.session.username, data],
        function (err) {
            if (err) return res.status(500).json({ error: 'Erro ao salvar' });
            res.json({ success: true });
        }
    );
});

router.get('/', requireAdmin, (req, res) => {
    db.all(`SELECT * FROM candidaturas ORDER BY criado_em DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar' });
        res.json(rows);
    });
});

router.delete('/:id', requireAdmin, (req, res) => {
    db.run(`DELETE FROM candidaturas WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao deletar' });
        res.json({ success: true });
    });
});

module.exports = router;