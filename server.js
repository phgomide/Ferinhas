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
  crossOriginResourcePolicy: { policy: "cross-origin" }, // <-- ESTA É A LINHA QUE CORRIGE O ERRO
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

app.use(express.json({ limit: '10kb' }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(sessionConfig);

app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});