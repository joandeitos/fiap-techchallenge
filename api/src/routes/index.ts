import { Router } from 'express';
import authRoutes from './auth';
import postRoutes from './posts';
import userRoutes from './users';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/users', userRoutes);

export default router; 