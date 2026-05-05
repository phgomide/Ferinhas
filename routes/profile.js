const express = require('express');
const db = require('../config/db');
const { requireAuth, requirePadrinhoOrAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.delete('/comments/:commentId', requireAuth, (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const userId = req.session.userId;
    const isAdmin = req.session.role === 'admin';

    db.get(`SELECT user_id FROM comments WHERE id = ?`, [commentId], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Não encontrado' });
        if (!isAdmin && row.user_id !== userId) return res.status(403).json({ error: 'Acesso negado' });

        db.run(`DELETE FROM comments WHERE id = ?`, [commentId], (err) => {
            if (err) return res.status(500).json({ error: 'Erro interno' });
            res.json({ success: true });
        });
    });
});

router.get('/:userId/comments', (req, res) => {
    const padrinhoId = parseInt(req.params.userId);
    db.all(`SELECT * FROM comments WHERE padrinho_id = ? ORDER BY created_at DESC`, [padrinhoId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro interno' });
        res.json(rows);
    });
});

router.post('/:userId/comments', requireAuth, (req, res) => {
    const padrinhoId = parseInt(req.params.userId);
    const userId = req.session.userId;
    const username = req.session.username;
    const { comment } = req.body;

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0 || comment.length > 500) {
        return res.status(400).json({ error: 'Comentário inválido' });
    }

    const createdAt = new Date().toISOString();
    db.run(`INSERT INTO comments (padrinho_id, user_id, username, comment, created_at) VALUES (?, ?, ?, ?, ?)`, [padrinhoId, userId, username, comment.trim(), createdAt],
        function (err) {
            if (err) return res.status(500).json({ error: 'Erro interno' });
            res.json({ id: this.lastID, padrinho_id: padrinhoId, user_id: userId, username, comment: comment.trim(), created_at: createdAt });
        });
});

router.post('/:userId/like', requireAuth, (req, res) => {
    const padrinhoId = parseInt(req.params.userId);
    const userId = req.session.userId;

    db.get(`SELECT 1 FROM padrinho_likes WHERE user_id = ? AND padrinho_id = ?`, [userId, padrinhoId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro interno' });
        if (row) {
            db.run(`DELETE FROM padrinho_likes WHERE user_id = ? AND padrinho_id = ?`, [userId, padrinhoId], (err) => {
                if (err) return res.status(500).json({ error: 'Erro' });
                res.json({ liked: false });
            });
        } else {
            db.run(`INSERT INTO padrinho_likes (user_id, padrinho_id) VALUES (?, ?)`, [userId, padrinhoId], (err) => {
                if (err) return res.status(500).json({ error: 'Erro' });
                res.json({ liked: true });
            });
        }
    });
});

router.get('/:userId', requirePadrinhoOrAdmin, (req, res) => {
    const targetId = parseInt(req.params.userId);
    if (req.session.role !== 'admin' && req.session.userId !== targetId) {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    db.get(`SELECT * FROM padrinhos WHERE user_id = ?`, [targetId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro interno' });
        res.json(row || {});
    });
});

router.post('/:userId', requirePadrinhoOrAdmin, upload.single('imgFile'), (req, res) => {
    const targetId = parseInt(req.params.userId);
    if (req.session.role !== 'admin' && req.session.userId !== targetId) {
        return res.status(403).json({ error: 'Acesso negado' });
    }

    const { name, labs, interests, bio, question, github, linkedin, email, existingImg } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Nome obrigatório' });
    }

    let finalImgPath = '';
    if (req.file) {
        finalImgPath = `/images/${req.file.filename}`; // <-- Agora salva com /images/
    } else if (typeof existingImg === 'string' && (existingImg.startsWith('/uploads/') || existingImg.startsWith('/images/'))) {
        finalImgPath = existingImg.replace('/uploads/', '/images/');
    }

    db.get(`SELECT id FROM padrinhos WHERE user_id = ?`, [targetId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro interno' });
        if (row) {
            db.run(
                `UPDATE padrinhos SET name=?, img=?, labs=?, interests=?, bio=?, question=?, github=?, linkedin=?, email=? WHERE user_id=?`, [name, finalImgPath, labs, interests, bio, question, github, linkedin, email, targetId],
                (err) => {
                    if (err) return res.status(500).json({ error: 'Erro interno' });
                    res.json({ success: true, img: finalImgPath });
                }
            );
        } else {
            db.run(
                `INSERT INTO padrinhos (user_id, name, img, labs, interests, bio, question, github, linkedin, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [targetId, name, finalImgPath, labs, interests, bio, question, github, linkedin, email],
                (err) => {
                    if (err) return res.status(500).json({ error: 'Erro interno' });
                    res.json({ success: true, img: finalImgPath });
                }
            );
        }
    });
});

module.exports = router;