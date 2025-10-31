import 'dotenv/config';

const rawPort = Number(process.env.PORT);

export const PORT = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 8080;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const allowList = (process.env.CORS_ORIGIN || '*')
	.split(',')
	.map((entry) => entry.trim())
	.filter(Boolean);

export const CORS_ALLOW_LIST = allowList.length > 0 ? allowList : ['*'];
