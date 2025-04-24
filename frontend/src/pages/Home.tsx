import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import PostList from '../components/PostList';
import api from '../services/api';
import { Post } from '../types/post';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await api.get<Post[]>('/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Blog dos Professores
        </Typography>
        <PostList posts={posts} onPostDeleted={fetchPosts} />
      </Box>
    </Container>
  );
} 