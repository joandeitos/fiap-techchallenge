import { Request, Response } from 'express';
import { User } from '../models/User';
import logger from '../config/logger';
import bcrypt from 'bcryptjs';

// Listar todos os usuários
export const listUsers = async (_: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    logger.info('Usuários listados com sucesso');
    res.json(users);
  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
};

// Buscar usuário por ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn('Usuário não encontrado');
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    logger.info('Usuário encontrado com sucesso');
    res.json(user);
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};

// Criar um novo usuário
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    logger.info('Criação de usuário:', { 
      email: userData.email, 
      hashedPassword,
      originalPassword: password 
    });
    
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    
    await user.save();
    logger.info('Usuário criado com sucesso');
    res.status(201).json(user);
  } catch (error) {
    logger.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

// Atualizar um usuário
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      logger.warn('Usuário não encontrado para atualização');
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    logger.info('Usuário atualizado com sucesso');
    res.json(user);
  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

// Deletar um usuário
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      logger.warn('Usuário não encontrado para exclusão');
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    logger.info('Usuário deletado com sucesso');
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
};

// Atualizar o próprio perfil
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verifica se o usuário está tentando atualizar seu próprio perfil
    if (req.user?.id !== req.params.id) {
      logger.warn('Tentativa de atualização de perfil não autorizada', {
        requestUserId: req.user?.id,
        targetUserId: req.params.id,
        requestBody: req.body
      });
      res.status(403).json({ message: 'Você só pode atualizar seu próprio perfil' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn('Usuário não encontrado para atualização');
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    // Remove campos que não podem ser atualizados pelo usuário
    const updateData: any = {
      name: req.body.name
    };

    if (req.user.role === 'admin') {
      updateData.email = req.body.email;
    }

    if (req.user.role === 'professor') {
      updateData.discipline = req.body.discipline;
    }

    // Se estiver alterando a senha
    if (req.body.currentPassword && req.body.newPassword) {
      const isValidPassword = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isValidPassword) {
        res.status(401).json({ message: 'Senha atual incorreta' });
        return;
      }

      // Hash da nova senha
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    logger.info('Perfil atualizado com sucesso');
    res.json(updatedUser);
  } catch (error) {
    logger.error('Erro ao atualizar perfil:', error);
    console.error('Detalhes do erro:', {
      error,
      userId: req.params.id,
      requestBody: req.body,
      user: req.user
    });
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
}; 