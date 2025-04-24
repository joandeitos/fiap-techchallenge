import { User } from '../models/User';
import Post from '../models/Post';
import logger from '../config/logger';
import { AuthController } from '../controllers/AuthController';
import { Request, Response } from 'express';

// Mock de request e response para usar o AuthController
const mockRequest = (body: any) => {
  const req = {} as Request;
  req.body = body;
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    return res;
  };
  return res;
};

export async function initializeSystem() {
  try {
    // Verifica se já existe algum usuário
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      logger.info('Nenhum usuário encontrado. Criando usuário padrão...');
      
      // Usa o método de registro da API
      const req = mockRequest({
        name: 'Administrador',
        email: 'admin@system.com',
        password: '123456',
        role: 'admin'
      });
      
      const res = mockResponse();
      
      await AuthController.register(req, res);

      logger.info('Usuário administrador criado com sucesso');

      // Verifica se já existe algum post
      const postCount = await Post.countDocuments();

      if (postCount === 0) {
        logger.info('Nenhum post encontrado. Criando post inicial...');

        // Busca o usuário admin criado
        const adminUser = await User.findOne({ email: 'admin@system.com' });
        
        if (!adminUser) {
          throw new Error('Usuário administrador não encontrado após criação');
        }

        // Cria o post inicial
        await Post.create({
          title: 'Post exemplo',
          content: `
            <h2>Bem-vindo ao Sistema de Blog para Professores!</h2>
            
            <p>Este é um espaço dedicado ao compartilhamento de conhecimento e experiências entre professores. 
            Aqui você poderá:</p>
            
            <ul>
              <li>Compartilhar suas experiências em sala de aula</li>
              <li>Publicar artigos sobre metodologias de ensino</li>
              <li>Discutir práticas pedagógicas</li>
              <li>Interagir com outros professores</li>
            </ul>

            <p>Para começar, faça login com suas credenciais ou crie uma nova conta.</p>

            <h3>Próximos Passos</h3>
            <ol>
              <li>Explore os posts existentes</li>
              <li>Crie seu primeiro post</li>
              <li>Complete seu perfil</li>
              <li>Conecte-se com outros professores</li>
            </ol>

            <p>Estamos felizes em ter você conosco!</p>
          `,
          author: adminUser._id
        });

        logger.info('Post inicial criado com sucesso');
      }
    }
  } catch (error) {
    logger.error('Erro ao inicializar o sistema:', error);
    throw error;
  }
} 