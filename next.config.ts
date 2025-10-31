<<<<<<< HEAD
import type { NextConfig } from 'next'
const nextConfig: NextConfig = { images: { domains: [] } }
export default nextConfig
=======
import type { NextConfig } from 'next';
import nextConfigCjs from './next.config.js';

const nextConfig: NextConfig = nextConfigCjs as NextConfig;

export default nextConfig;
>>>>>>> efbbf19 (chore4)
