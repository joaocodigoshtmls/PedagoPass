import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PORT, CORS_ORIGIN } from './config';
import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import communityRoutes from './routes/communities';
import reservationsRoutes from './routes/reservations';
import ordersRoutes from './routes/orders';

const app = express();

app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','), credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use('/communities', communityRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/orders', ordersRoutes);

app.use((_req: Request, res: Response) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
