import { SignOptions } from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '1d'; 