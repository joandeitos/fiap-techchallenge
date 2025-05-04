import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import DOMPurify from 'dompurify';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface User {
  id: string;
  role: string;
}

export default function ViewPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get<Post>(`/api/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError('Erro ao carregar o post. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const canManagePost = (post: Post | null, user: User | null): boolean => {
    if (!post || !user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'professor' && post.author.id === user.id) return true;
    return false;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const createMarkup = (content: string) => {
    return { __html: DOMPurify.sanitize(content) };
  };

  const handleDelete = async () => {
    if (!post) return;
    try {
      const token = localStorage.getItem('token');

      console.log(token);
      console.log(post.id);
      
      await axios.delete(`/api/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      navigate('/');
    } catch (error) {
      console.error('Erro ao deletar post:', error);
    }
  };

  const handleEdit = () => {
    if (!post) return;
    navigate(`/post/${post.id}/edit`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Post não encontrado.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <IconButton 
        onClick={() => navigate(-1)} 
        sx={{ mb: 2 }}
        aria-label="voltar"
      >
        <ArrowBackIcon />
      </IconButton>
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>
          {canManagePost(post, user) && (
            <IconButton
              color="primary"
              aria-label="editar post"
              onClick={handleEdit}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Por {post.author.name} em {formatDate(post.createdAt)}
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ mt: 3 }}
          dangerouslySetInnerHTML={createMarkup(post.content)}
        />
      </Paper>
    </Container>
  );
} 