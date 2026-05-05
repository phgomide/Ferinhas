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

module.exports = { requireAuth, requireAdmin, requirePadrinhoOrAdmin };