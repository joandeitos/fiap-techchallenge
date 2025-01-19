const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Post = require('../models/Post');
const User = require('../models/User');

describe('Post Endpoints', () => {
  let mongoServer;
  let testUser;

beforeAll(async () => {
  console.log('Iniciando o MongoMemoryServer...');
  mongoServer = await MongoMemoryServer.create();
  console.log('MongoMemoryServer iniciado:', mongoServer);
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Conectado ao MongoDB');
});


afterAll(async () => {
  console.log('Desconectando do MongoDB...');
  await mongoose.disconnect();
  console.log('Desconectado do MongoDB');
  console.log('Parando o MongoMemoryServer...');
  await mongoServer.stop();
  console.log('MongoMemoryServer parado');
}, 15000); // Timeout de 15 segundos para finalizar o afterAll


  beforeEach(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});

    // Criar um usuário para teste
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      discipline: 'Test Discipline',
      role: 'professor'
    });
  });

  it('should create a new post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({
        title: 'Test Post',
        content: 'Test Content',
        author: testUser._id // Usando o ID do usuário criado
      });
      
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Post');
    expect(res.body.author).toBe(testUser._id.toString());
  });

  it('should get all posts', async () => {
    await Post.create({
      title: 'Test Post',
      content: 'Test Content',
      author: testUser._id
    });

    const res = await request(app)
      .get('/api/posts');
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.posts)).toBeTruthy();
    expect(res.body.posts.length).toBe(1);
    expect(res.body.posts[0].author.name).toBe(testUser.name);
  });

  it('should get a specific post', async () => {
    const post = await Post.create({
      title: 'Test Post',
      content: 'Test Content',
      author: testUser._id
    });

    const res = await request(app)
      .get(`/api/posts/${post._id}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Post');
  });

  it('should update a post', async () => {
    const post = await Post.create({
      title: 'Test Post',
      content: 'Test Content',
      author: testUser._id
    });

    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .send({
        title: 'Updated Post',
        content: 'Updated Content'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Post');
    expect(res.body.author).toBe(testUser._id.toString());
  });

  it('should delete a post', async () => {
    const post = await Post.create({
      title: 'Test Post',
      content: 'Test Content',
      author: testUser._id
    });

    const res = await request(app)
      .delete(`/api/posts/${post._id}`);
    
    expect(res.statusCode).toBe(200);
    
    const deletedPost = await Post.findById(post._id);
    expect(deletedPost).toBeNull();
  });

  it('should search posts by term', async () => {
    await Post.create([
      {
        title: 'Mathematics Class',
        content: 'Learning about algebra',
        author: testUser._id
      },
      {
        title: 'History Class',
        content: 'Learning about mathematics in history',
        author: testUser._id
      }
    ]);

    const res = await request(app)
      .get('/api/posts/search?q=mathematics');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(2);
    expect(res.body[0].author.name).toBe(testUser.name);
  });

  it('should handle invalid post ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/posts/${invalidId}`);
    
    expect(res.statusCode).toBe(404);
  });
});