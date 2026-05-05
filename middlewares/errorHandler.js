const multer = require('multer');

module.exports = (err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message === 'Apenas imagens permitidas') {
        return res.status(400).json({ error: 'Arquivo inválido ou muito grande (máx 2MB).' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
};