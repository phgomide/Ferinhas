const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database.sqlite');

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
      friend_group TEXT DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      padrinho_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (padrinho_id) REFERENCES padrinhos (user_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS padrinho_likes (
      user_id INTEGER NOT NULL,
      padrinho_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, padrinho_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (padrinho_id) REFERENCES padrinhos (user_id) ON DELETE CASCADE
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

module.exports = db;