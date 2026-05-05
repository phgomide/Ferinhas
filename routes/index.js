const express = require('express');
const authRoutes = require('./auth');
const candidatesRoutes = require('./candidates');
const profileRoutes = require('./profile');
const candidaturasRoutes = require('./candidaturas');
const usersRoutes = require('./users');
const statsRoutes = require('./stats');
const { apiLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

router.use(apiLimiter);
router.use('/', authRoutes);
router.use('/candidates', candidatesRoutes);
router.use('/profile', profileRoutes);
router.use('/candidaturas', candidaturasRoutes);
router.use('/users', usersRoutes);
router.use('/stats', statsRoutes);

module.exports = router;