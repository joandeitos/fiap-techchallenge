import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  discipline?: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Usuário inativo' });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      discipline: user.discipline
    };

    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    return next();
  } catch (error) {
    logger.error('Erro na verificação de admin:', error);
    return res.status(500).json({ message: 'Erro ao verificar permissões de administrador' });
  }
};

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    next();
  };
}; 