import express, { Router } from 'express';
import { PostController } from '../controllers/postController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do post
 *         title:
 *           type: string
 *           description: Título do post
 *         content:
 *           type: string
 *           description: Conteúdo do post
 *         author:
 *           type: string
 *           description: ID do autor do post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do post
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do post
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Lista todos os posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Erro interno do servidor
 * 
 *   post:
 *     summary: Criar novo post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 * 
 * /api/posts/search:
 *   get:
 *     summary: Busca posts por termo
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Termo de busca nos posts
 *     responses:
 *       200:
 *         description: Posts encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Termo de busca não fornecido
 *       500:
 *         description: Erro interno do servidor
 * 
 * /api/posts/{id}:
 *   get:
 *     summary: Buscar post por ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do post
 *     responses:
 *       200:
 *         description: Post encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post não encontrado
 *       500:
 *         description: Erro interno do servidor
 * 
 *   put:
 *     summary: Atualiza um post existente
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do post a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Novo título do post
 *               content:
 *                 type: string
 *                 description: Novo conteúdo do post
 *     responses:
 *       200:
 *         description: Post atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Post não encontrado
 *       500:
 *         description: Erro interno do servidor
 *
 *   delete:
 *     summary: Remove um post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do post a ser removido
 *     responses:
 *       200:
 *         description: Post removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Post não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

// Rotas públicas
router.get('/', PostController.getAll);
router.get('/search', PostController.searchPosts);
router.get('/:id', PostController.getById);

// Rotas protegidas
router.post('/', authMiddleware, roleMiddleware(['admin', 'professor']), PostController.create);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'professor']), PostController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), PostController.delete);

// Rota de seed (apenas desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  router.post('/seed', PostController.seedPosts);
}

export default router; 