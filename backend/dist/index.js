import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import { CORS_ALLOW_LIST, NODE_ENV, LOG_LEVEL } from './config';
import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import communityRoutes from './routes/communities';
import reservationsRoutes from './routes/reservations';
import ordersRoutes from './routes/orders';
// Logger
const log = pino({ level: LOG_LEVEL });
const app = express();
// ✅ HEALTH CHECK FIRST - No middleware, no DB
app.get('/health', (_req, res) => {
    res.status(200).send('ok');
});
// Security & Performance
app.use(helmet());
app.use(compression());
app.disable('x-powered-by');
app.set('trust proxy', 1);
// Body parsing (before other middleware)
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
// Rate limiting (300 req/min per IP)
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    message: 'Too many requests from this IP',
});
app.use(limiter);
// CORS - parse comma-separated origins
const allowList = CORS_ALLOW_LIST;
app.use(cors({
    origin(origin, cb) {
        if (!origin || allowList.includes('*') || allowList.includes(origin)) {
            return cb(null, true);
        }
        return cb(new Error('CORS blocked'));
    },
    credentials: true,
}));
// Request logging
app.use((req, res, next) => {
    log.info({ method: req.method, url: req.url, ip: req.ip });
    next();
});
// Routes
app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use('/communities', communityRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/orders', ordersRoutes);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
// Error handler
app.use((err, _req, res, _next) => {
    log.error({ error: err.message, stack: err.stack });
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
// Server startup & graceful shutdown
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0'; // Bind to all interfaces
const server = app.listen(PORT, HOST, () => {
    log.info({ msg: 'API up', host: HOST, port: PORT, env: NODE_ENV });
    console.log(`✅ API listening on http://${HOST}:${PORT}`);
});
const close = () => {
    log.info('Shutting down gracefully...');
    server.close(() => {
        log.info('Server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', close);
process.on('SIGINT', close);
process.on('unhandledRejection', (reason) => {
    log.error({ msg: 'Unhandled Rejection', reason });
});
process.on('uncaughtException', (error) => {
    log.fatal({ msg: 'Uncaught Exception', error: error.message, stack: error.stack });
    process.exit(1);
});
