import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import logger from '../config/logger';
import { IUser } from '../models/User';
import { validationResult } from 'express-validator';
import { compare } from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth';

const jwtOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN as any // usando type assertion temporariamente
};

interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  discipline?: string;
}

export const AuthController = {
  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Usuário inativo' });
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }

      user.lastLogin = new Date();
      await user.save();

      const payload: JwtPayload = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        discipline: user.discipline
      };

      const token = jwt.sign(payload, JWT_SECRET, jwtOptions);

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          discipline: user.discipline,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      logger.error('Erro no login:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role, discipline } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'aluno',
        discipline: role === 'professor' ? discipline : undefined
      });

      const savedUser = await User.findById(user._id).select('-password');
      if (!savedUser) {
        throw new Error('Usuário não encontrado após criação');
      }

      const payload: JwtPayload = {
        id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        discipline: savedUser.discipline
      };

      const token = jwt.sign(payload, JWT_SECRET, jwtOptions);

      return res.status(201).json({
        token,
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          discipline: savedUser.discipline,
          lastLogin: savedUser.lastLogin
        }
      });
    } catch (error) {
      logger.error('Erro no registro:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async me(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        discipline: user.discipline,
        lastLogin: user.lastLogin
      });
    } catch (error) {
      logger.error('Erro ao buscar dados do usuário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const { name, email, role, discipline } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email já está em uso' });
        }
        user.email = email;
      }

      if (name) user.name = name;
      
      // Atualiza o papel e a disciplina
      if (role) {
        user.role = role;
        if (role === 'professor') {
          // Define "Not Defined" como disciplina padrão se nenhuma for fornecida
          user.discipline = discipline || 'Not Defined';
        } else {
          user.discipline = undefined;
        }
      }

      await user.save();

      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        discipline: user.discipline
      });
    } catch (error) {
      logger.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id).select('+password');

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Senha atual incorreta' });
      }

      user.password = newPassword;
      await user.save();

      return res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      logger.error('Erro ao alterar senha:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}; 