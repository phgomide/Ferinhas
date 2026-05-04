require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('./database.sqlite');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "script-src-attr": ["'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
      "img-src": ["'self'", "data:", "blob:", "https:", "http:"]
    }
  }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = crypto.randomBytes(12).toString('hex') + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens permitidas'));
  }
});

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente mais tarde.' }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'candidato'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS candidaturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_usuario TEXT NOT NULL,
      sobre_usuario TEXT DEFAULT '',
      padrinho_escolhido TEXT NOT NULL DEFAULT 'TANTO_FAZ',
      usuario_login TEXT NOT NULL,
      criado_em TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS padrinhos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      img TEXT,
      labs TEXT,
      interests TEXT,
      bio TEXT,
      question TEXT,
      github TEXT,
      linkedin TEXT,
      email TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (adminUser && adminPass) {
    bcrypt.hash(adminPass, 10, (err, hash) => {
      if (err) return;
      db.get(`SELECT id FROM users WHERE username = ?`, [adminUser], (err, row) => {
        if (row) {
          db.run(`UPDATE users SET password = ?, role = 'admin' WHERE username = ?`, [hash, adminUser]);
        } else {
          db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')`, [adminUser, hash]);
        }
      });
    });
  }
});

const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Não autorizado' });
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
  next();
};

const requirePadrinhoOrAdmin = (req, res, next) => {
  if (!req.session.userId || (req.session.role !== 'admin' && req.session.role !== 'padrinho')) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};

app.post('/api/register', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function (err) {
      if (err) return res.status(400).json({ error: 'Usuário já existe' });
      req.session.userId = this.lastID;
      req.session.username = username;
      req.session.role = 'candidato';
      res.json({ success: true, username: username, role: 'candidato' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Credenciais inválidas' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    res.json({ username: user.username, role: user.role, userId: user.id });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/session', (req, res) => {
  if (req.session.userId) {
    res.json({ username: req.session.username, role: req.session.role, userId: req.session.userId });
  } else {
    res.status(401).json({ error: 'Não logado' });
  }
});

app.get('/api/candidates', (req, res) => {
  db.all(`SELECT * FROM padrinhos`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao carregar candidatos' });
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
      email: r.email
    }));
    res.json(formatted);
  });
});

app.get('/api/profile/:userId', requirePadrinhoOrAdmin, (req, res) => {
  const targetId = parseInt(req.params.userId);
  if (req.session.role !== 'admin' && req.session.userId !== targetId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  db.get(`SELECT * FROM padrinhos WHERE user_id = ?`, [targetId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar perfil' });
    res.json(row || {});
  });
});

app.post('/api/profile/:userId', requirePadrinhoOrAdmin, upload.single('imgFile'), (req, res) => {
  const targetId = parseInt(req.params.userId);
  if (req.session.role !== 'admin' && req.session.userId !== targetId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { name, labs, interests, bio, question, github, linkedin, email, existingImg } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

  let finalImgPath = existingImg || '';
  if (req.file) {
    finalImgPath = `/uploads/${req.file.filename}`;
  }

  db.get(`SELECT id FROM padrinhos WHERE user_id = ?`, [targetId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor' });
    if (row) {
      db.run(
        `UPDATE padrinhos SET name=?, img=?, labs=?, interests=?, bio=?, question=?, github=?, linkedin=?, email=? WHERE user_id=?`, [name, finalImgPath, labs, interests, bio, question, github, linkedin, email, targetId],
        (err) => {
          if (err) return res.status(500).json({ error: 'Erro ao atualizar' });
          res.json({ success: true, img: finalImgPath });
        }
      );
    } else {
      db.run(
        `INSERT INTO padrinhos (user_id, name, img, labs, interests, bio, question, github, linkedin, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [targetId, name, finalImgPath, labs, interests, bio, question, github, linkedin, email],
        (err) => {
          if (err) return res.status(500).json({ error: 'Erro ao criar' });
          res.json({ success: true, img: finalImgPath });
        }
      );
    }
  });
});

app.post('/api/candidaturas', requireAuth, (req, res) => {
  const { nome, sobre, padrinho } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome obrigatório' });
  const padrinhoFinal = padrinho || 'TANTO_FAZ';
  const data = new Date().toISOString();
  db.run(
    `INSERT INTO candidaturas (nome_usuario, sobre_usuario, padrinho_escolhido, usuario_login, criado_em) VALUES (?, ?, ?, ?, ?)`, [nome, sobre, padrinhoFinal, req.session.username, data],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao salvar' });
      res.json({ success: true });
    }
  );
});

app.get('/api/candidaturas', requireAdmin, (req, res) => {
  db.all(`SELECT * FROM candidaturas ORDER BY criado_em DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar' });
    res.json(rows);
  });
});

app.delete('/api/candidaturas/:id', requireAdmin, (req, res) => {
  db.run(`DELETE FROM candidaturas WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Erro ao deletar' });
    res.json({ success: true });
  });
});

app.get('/api/users', requireAdmin, (req, res) => {
  db.all(`SELECT id, username, role FROM users ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar usuários' });
    res.json(rows);
  });
});

app.delete('/api/users/:id', requireAdmin, (req, res) => {
  if (parseInt(req.params.id) === req.session.userId) {
    return res.status(400).json({ error: 'Não é possível deletar a si mesmo' });
  }
  db.serialize(() => {
    // Exclui o perfil para não ficar órfão
    db.run(`DELETE FROM padrinhos WHERE user_id = ?`, [req.params.id]);
    db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao deletar usuário' });
      res.json({ success: true });
    });
  });
});

app.patch('/api/users/:id/role', requireAdmin, (req, res) => {
  if (parseInt(req.params.id) === req.session.userId) {
    return res.status(400).json({ error: 'Você não pode alterar seu próprio papel' });
  }
  const { role } = req.body;
  if (!['candidato', 'padrinho', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Papel inválido' });
  }
  db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Erro ao atualizar papel' });
    res.json({ success: true });
  });
});

app.post('/api/users/:id/reset-password', requireAdmin, async (req, res) => {
  const newPassword = crypto.randomBytes(4).toString('hex');
  const hash = await bcrypt.hash(newPassword, 10);
  db.run(`UPDATE users SET password = ? WHERE id = ?`, [hash, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Erro ao resetar senha' });
    res.json({ success: true, newPassword });
  });
});

app.get('/api/stats', requireAdmin, (req, res) => {
  const today = new Date().toISOString().slice(0, 10) + '%';
  db.get(`SELECT COUNT(*) as total FROM candidaturas`, [], (err, rowTotal) => {
    db.get(`SELECT COUNT(*) as today FROM candidaturas WHERE criado_em LIKE ?`, [today], (err, rowToday) => {
      db.get(`SELECT COUNT(*) as random FROM candidaturas WHERE padrinho_escolhido = 'TANTO_FAZ'`, [], (err, rowRandom) => {
        res.json({ total: rowTotal.total, today: rowToday.today, random: rowRandom.random });
      });
    });
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Apenas imagens permitidas') {
    return res.status(400).json({ error: 'Arquivo inválido ou muito grande (máx 2MB).' });
  }
  next();
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});