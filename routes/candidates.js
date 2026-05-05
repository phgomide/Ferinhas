const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
    const userId = req.session ? (req.session.userId || 0) : 0;

    db.all(`
    SELECT p.*,
      (SELECT COUNT(*) FROM padrinho_likes WHERE padrinho_id = p.user_id) as likes_count,
      (SELECT 1 FROM padrinho_likes WHERE padrinho_id = p.user_id AND user_id = ?) as is_liked
    FROM padrinhos p
  `, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro interno' });

        const formatted = rows.map(r => ({
            id: r.id,
            user_id: r.user_id,
            name: r.name,
            img: r.img,
            labs: r.labs ? r.labs.split(',').map(s => s.trim()) : [],
            interests: r.interests ? r.interests.split(',').map(s => s.trim()) : [],
            bio: r.bio,
            question: r.question,
            github: r.github,
            linkedin: r.linkedin,
            email: r.email,
            friend_group: r.friend_group,
            likes_count: r.likes_count || 0,
            is_liked: !!r.is_liked
        }));

        res.json(formatted);
    });
});

module.exports = router;