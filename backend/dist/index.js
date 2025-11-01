"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pino_1 = __importDefault(require("pino"));
const config_1 = require("./config");
const auth_1 = __importDefault(require("./routes/auth"));
const me_1 = __importDefault(require("./routes/me"));
const communities_1 = __importDefault(require("./routes/communities"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const orders_1 = __importDefault(require("./routes/orders"));
// Logger
const log = (0, pino_1.default)({ level: config_1.LOG_LEVEL });
const app = (0, express_1.default)();
// 1) HEALTH CHECK FIRST - no middlewares, no DB
app.get('/health', (_req, res) => {
    res.status(200).send('ok');
});
// Optional alias if using /api prefix in infra
app.get('/api/health', (_req, res) => {
    res.status(200).send('ok');
});
// 2) Basics: JSON body parsing BEFORE other middlewares
app.use(express_1.default.json({ limit: '1mb' }));
// CORS: comma-separated env list; empty list => allow all origins
const allow = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin(origin, cb) {
        if (!origin || allow.length === 0 || allow.includes(origin))
            return cb(null, true);
        return cb(new Error('CORS'));
    },
    credentials: true,
}));
// Security & Performance
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.disable('x-powered-by');
app.set('trust proxy', 1);
// Other parsers/cookies
app.use((0, cookie_parser_1.default)());
// 3) Rate limiting (300 req/min per IP)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 300,
    message: 'Too many requests from this IP',
});
app.use(limiter);
// Request logging
app.use((req, res, next) => {
    log.info({ method: req.method, url: req.url, ip: req.ip });
    next();
});
// 4) Routes
app.use('/auth', auth_1.default);
app.use('/me', me_1.default);
app.use('/communities', communities_1.default);
app.use('/reservations', reservations_1.default);
app.use('/orders', orders_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
// Error handler
app.use((err, _req, res, _next) => {
    log.error({ error: err.message, stack: err.stack });
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
// 5) Server startup & graceful shutdown (Railway injects PORT)
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0'; // Bind to all interfaces
const server = app.listen(PORT, HOST, () => {
    log.info({ msg: 'API up', host: HOST, port: PORT, env: config_1.NODE_ENV });
    console.log(`API up on http://${HOST}:${PORT}`);
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
//# sourceMappingURL=index.js.map