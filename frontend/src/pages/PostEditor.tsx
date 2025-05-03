import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  id?: string;
  title: string;
  content: string;
}

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post>({
    title: '',
    content: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isEditing = Boolean(id);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'professor') {
      navigate('/');
      return;
    }

    if (id) {
      fetchPost();
    }
  }, [id, user, navigate]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get<Post>(`/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      setError('Erro ao carregar o post. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/api/posts/${id}`, post);
      } else {
        await api.post('/api/posts', post);
      }
      navigate('/');
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      setError('Erro ao salvar o post. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await api.delete(`/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/');
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      setError('Erro ao deletar o post. Por favor, tente novamente.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && isEditing) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Carregando...</Typography>
        </Box>
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

      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Post' : 'Novo Post'}
          </Typography>
          {isEditing && (
            <IconButton
              onClick={() => setDeleteDialogOpen(true)}
              color="error"
              aria-label="deletar post"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Título"
              name="title"
              value={post.title}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Conteúdo"
              name="content"
              value={post.content}
              onChange={handleChange}
              required
              multiline
              rows={15}
              sx={{ mb: 3 }}
              helperText="Você pode usar tags HTML para formatar o conteúdo (ex: <h3>, <p>, <strong>, <ul>, <li>, <blockquote>, <pre>, <code>)"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 