require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const sessionConfig = require('./config/session');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"], 
      "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
      "img-src": ["'self'", "data:", "blob:", "https:", "http:"],
      "connect-src": ["'self'"] 
    }
  }
}));

app.use(express.json({ limit: '10kb' }));

app.use('/api', routes);

app.use('/images', express.static('/data/images'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Legacy support

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});