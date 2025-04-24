import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface PostResponse {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const NewPost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Redireciona para a página inicial se o usuário não estiver logado
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<PostResponse>('/api/posts', {
        title,
        content,
      });
      navigate(`/post/${response.data._id}`);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      setError('Erro ao criar o post. Verifique se você está logado e tente novamente.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!user) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Novo Post
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Conteúdo"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            required
            multiline
            rows={15}
            helperText="Você pode usar tags HTML para formatar o conteúdo (ex: <h3>, <p>, <strong>, <ul>, <li>, <blockquote>, <pre>, <code>)"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Criar Post
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewPost; 