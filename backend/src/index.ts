import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PORT, CORS_ALLOW_LIST } from './config';
import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import communityRoutes from './routes/communities';
import reservationsRoutes from './routes/reservations';
import ordersRoutes from './routes/orders';

const app = express();

const allowList = CORS_ALLOW_LIST;

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowList.includes('*') || allowList.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked'), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req: Request, res: Response) => res.status(200).send('ok'));

app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use('/communities', communityRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/orders', ordersRoutes);

app.use((_req: Request, res: Response) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, () => {
  console.log(`API up on :${PORT}`);
});
