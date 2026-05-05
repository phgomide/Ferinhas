const session = require('express-session');
const crypto = require('crypto');
const SQLiteStore = require('connect-sqlite3')(session);

module.exports = session({
    store: new SQLiteStore({
        db: 'sessions.sqlite',
        dir: '/data',
        table: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
});