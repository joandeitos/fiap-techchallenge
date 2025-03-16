import { Request, Response } from 'express';
import Post from '../models/Post';
import logger from '../config/logger';
import { SortOrder } from 'mongoose';
import { Error as MongooseError } from 'mongoose';

const transformPost = (post: any) => {
  if (!post) return null;
  const transformed = post.toObject();
  transformed.id = transformed._id;
  delete transformed._id;
  if (transformed.author) {
    transformed.author.id = transformed.author._id;
    delete transformed.author._id;
  }
  return transformed;
};

export const PostController = {
  async listPosts(_: Request, res: Response): Promise<void> {
    try {
      const options = {
        sort: { createdAt: -1 as SortOrder }
      };
      const posts = await Post.find({}, null, options).populate('author', 'name email');
      logger.info('Posts listados com sucesso');
      res.json(posts.map(transformPost));
    } catch (error) {
      logger.error('Erro ao listar posts:', error);
      res.status(500).json({ message: 'Erro ao listar posts' });
    }
  },

  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const post = await Post.findById(req.params.id).populate('author', 'name email');
      if (!post) {
        logger.warn('Post não encontrado');
        res.status(404).json({ message: 'Post não encontrado' });
        return;
      }
      logger.info('Post encontrado com sucesso');
      res.json(transformPost(post));
    } catch (error) {
      logger.error('Erro ao buscar post:', error);
      res.status(500).json({ message: 'Erro ao buscar post' });
    }
  },

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const post = new Post({
        ...req.body,
        author: req.user.id
      });
      
      await post.save();
      await post.populate('author', 'name email');
      
      logger.info('Post criado com sucesso');
      res.status(201).json(transformPost(post));
    } catch (error) {
      logger.error('Erro ao criar post:', error);

      if (error instanceof MongooseError.ValidationError) {
        const messages = Object.values(error.errors).map(err => err.message);
        res.status(400).json({ 
          message: 'Erro de validação',
          errors: messages
        });
        return;
      }

      res.status(500).json({ message: 'Erro ao criar post. Por favor, tente novamente.' });
    }
  },

  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('author', 'name email');
      if (!post) {
        logger.warn('Post não encontrado para atualização');
        res.status(404).json({ message: 'Post não encontrado' });
        return;
      }
      logger.info('Post atualizado com sucesso');
      res.json(transformPost(post));
    } catch (error) {
      logger.error('Erro ao atualizar post:', error);
      res.status(500).json({ message: 'Erro ao atualizar post' });
    }
  },

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const post = await Post.findByIdAndDelete(req.params.id);
      if (!post) {
        logger.warn('Post não encontrado para exclusão');
        res.status(404).json({ message: 'Post não encontrado' });
        return;
      }
      logger.info('Post deletado com sucesso');
      res.json({ message: 'Post deletado com sucesso' });
    } catch (error) {
      logger.error('Erro ao deletar post:', error);
      res.status(500).json({ message: 'Erro ao deletar post' });
    }
  },

  async searchPosts(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        res.status(400).json({ message: 'Termo de busca não fornecido' });
        return;
      }

      const searchRegex = new RegExp(q, 'i');
      const posts = await Post.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      }).populate('author', 'name email');

      logger.info('Busca realizada com sucesso');
      res.json(posts.map(transformPost));
    } catch (error) {
      logger.error('Erro ao buscar posts:', error);
      res.status(500).json({ message: 'Erro ao buscar posts' });
    }
  },

  async seedPosts(_: Request, res: Response): Promise<void> {
    try {
      const posts = await Post.create([
        {
          title: 'Introdução à Matemática',
          content: 'Nesta aula vamos aprender os conceitos básicos de matemática...',
          author: '65f9f5f5f5f5f5f5f5f5f5f5'
        },
        {
          title: 'Gramática Básica',
          content: 'Hoje vamos estudar as regras fundamentais da língua portuguesa...',
          author: '65f9f5f5f5f5f5f5f5f5f5f6'
        }
      ]);

      logger.info('Posts de exemplo criados com sucesso');
      res.json({
        message: 'Posts de exemplo criados com sucesso',
        posts: Array.isArray(posts) ? posts.map(transformPost) : transformPost(posts)
      });
    } catch (error) {
      logger.error('Erro ao criar posts de exemplo:', error);
      res.status(500).json({ message: 'Erro ao criar posts de exemplo' });
    }
  }
}; 