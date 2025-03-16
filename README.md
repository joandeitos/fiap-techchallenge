# Blog Tech Challenge - FIAP

## 📝 Descrição
Sistema de blog desenvolvido como parte do Tech Challenge da FIAP, focado em criar uma plataforma moderna e responsiva para publicação e gerenciamento de conteúdo. O projeto utiliza uma arquitetura em microsserviços, com frontend em React/TypeScript e backend em Node.js/TypeScript.

## 📹 Vídeo de Apresentação
⏳ Status: Pendente
> O vídeo de apresentação do projeto será disponibilizado em breve, demonstrando todas as funcionalidades implementadas e a arquitetura do sistema.

## 🚀 Funcionalidades

### 👥 Gestão de Usuários
- Autenticação JWT
- Registro de novos usuários
- Login seguro
- Perfis de usuário (Admin/Autor)
- Gerenciamento de permissões

### 📑 Gestão de Posts
- Criação, edição e exclusão de posts
- Editor de texto rico
- Suporte a markdown
- Visualização em tempo real
- Sistema de busca e filtros
- Ordenação por data e relevância

### 👨‍💼 Painel Administrativo
- Dashboard para gestão de conteúdo
- Gerenciamento de usuários
- Métricas e estatísticas
- Confirmação de ações críticas

### 🎨 Interface
- Tema claro/escuro
- Design responsivo
- Acessibilidade
- UX moderno e intuitivo

## 🛠 Tecnologias

### Frontend
- React 18
- TypeScript
- Material-UI v5
- React Router v6
- Axios
- DOMPurify
- Styled Components

### Backend
- Node.js
- TypeScript
- Express
- MongoDB
- JWT
- Mongoose
- Winston (Logging)
- Jest (Testes)

### DevOps
- Docker
- Docker Compose
- Nginx
- GitHub Actions

## 🏗 Arquitetura

### Frontend
```
frontend/
├── public/          # Arquivos públicos
├── src/
│   ├── components/  # Componentes React
│   ├── theme/       # Configuração de temas
│   ├── services/    # Serviços e API
│   └── types/       # Definições de tipos
```

### Backend
```
api/
├── src/
│   ├── config/      # Configurações
│   ├── controllers/ # Controladores
│   ├── middleware/  # Middlewares
│   ├── models/      # Modelos Mongoose
│   ├── routes/      # Rotas da API
│   ├── seeds/       # Dados iniciais
│   └── types/       # Definições de tipos
```

## 🚀 Como Executar

### Pré-requisitos
- Docker
- Docker Compose
- Node.js 18+
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/techchallenge02.git
cd techchallenge02
```

2. Configure as variáveis de ambiente:
```bash
# Na raiz do projeto
cp .env.example .env
```

3. Inicie os containers:
```bash
docker compose up -d
```

4. Acesse a aplicação:
- Frontend: http://localhost:3000
- API: http://localhost:4000
- Documentação API: http://localhost:4000/api-docs

### Desenvolvimento

1. Instale as dependências:
```bash
# Frontend
cd frontend
npm install

# Backend
cd api
npm install
```

2. Execute em modo desenvolvimento:
```bash
# Frontend
npm start

# Backend
npm run dev
```

## 🧪 Testes

```bash
# Frontend
cd frontend
npm test

# Backend
cd api
npm test
```

## 📚 Documentação API

A documentação da API está disponível em Swagger:
http://localhost:4000/api-docs

### Principais Endpoints

#### Autenticação
- POST /api/auth/login
- POST /api/auth/register

#### Posts
- GET /api/posts
- POST /api/posts
- GET /api/posts/:id
- PUT /api/posts/:id
- DELETE /api/posts/:id

#### Usuários
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Melhorias Futuras

- [ ] Implementação de testes E2E
- [ ] CI/CD completo
- [ ] Cache distribuído
- [ ] Sistema de notificações
- [ ] Integração com serviços de mídia
- [ ] Analytics avançado
- [ ] PWA
- [ ] Internacionalização

## 🤝 Suporte

Em caso de dúvidas ou problemas, abra uma issue ou entre em contato com a equipe de desenvolvimento.
