import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import logger from './config/logger';
import connectDB from './config/database';
import postRoutes from './routes/posts';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import path from 'path';
import dotenv from 'dotenv';
import { initializeSystem } from './utils/initializeSystem';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB e inicialização do sistema
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    initializeSystem()
      .then(() => logger.info('Sistema inicializado com sucesso'))
      .catch(err => logger.error('Erro ao inicializar o sistema:', err));
  });
}

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Blog dos Professores',
      version: '1.0.0',
      description: 'API para o blog dos professores',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js', path.join(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota raiz redireciona para a documentação
app.get('/', (_req, res) => {
  res.redirect('/api-docs');
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Tratamento de erros
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

export default app; 