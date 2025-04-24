import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Tooltip,
  styled,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Fab,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DOMPurify from 'dompurify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types/post';
import { User } from '../types/user';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  width: '100%',
  marginBottom: '16px',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  paddingBottom: '16px !important',
});

const PostContent = styled('div')(({ theme }) => ({
  marginTop: '16px',
  color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'rgba(0, 0, 0, 0.7)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  lineHeight: 1.5,

  '& img': {
    maxWidth: '100%',
    height: 'auto',
  },

  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  '& pre': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : '#f5f5f5',
    padding: '8px',
    borderRadius: '4px',
    overflowX: 'auto',
  },

  '& code': {
    fontFamily: "'Consolas', 'Monaco', monospace",
    fontSize: '0.9em',
    color: theme.palette.text.primary,
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  top: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
}));

const CreatePostButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  zIndex: 1000,
}));

type SortOrder = 'desc' | 'asc';

interface PostListProps {
  posts: Post[];
  onPostDeleted?: () => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onPostDeleted }) => {
  const [postsState, setPosts] = useState<Post[]>(posts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchPosts = async (query?: string) => {
    try {
      const url = query ? `/api/posts/search?q=${encodeURIComponent(query)}` : '/api/posts';
      const response = await axios.get<Post[]>(url);
      const sortedPosts = sortPosts(response.data, sortOrder);
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  const sortPosts = (postsToSort: Post[], order: SortOrder) => {
    return [...postsToSort].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };

  const handleToggleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    setPosts(sortPosts(postsState, newOrder));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const canManagePost = (post: Post) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'professor' && post.author.id === user.id) return true;
    return false;
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, post: Post) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleEditClick = () => {
    if (selectedPost) {
      navigate(`/post/${selectedPost.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPost) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/posts/${selectedPost.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(postsState.filter(post => post.id !== selectedPost.id));
        setDeleteDialogOpen(false);
        if (onPostDeleted) {
          onPostDeleted();
        }
      } catch (error) {
        console.error('Erro ao deletar post:', error);
      }
    }
    setSelectedPost(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPost(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    if (value.length >= 3) {
      fetchPosts(value);
    } else if (value.length === 0) {
      fetchPosts();
    }
  };

  const createMarkup = (content: string) => {
    return { __html: DOMPurify.sanitize(content) };
  };

  const handleCreatePost = () => {
    navigate('/post/new');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        mb: 4,
        gap: 3
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            textAlign: 'center',
            width: '100%'
          }}
        >
          Posts
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          width: '100%',
          maxWidth: '600px',
          justifyContent: 'center'
        }}>
          <TextField
            placeholder="Buscar posts..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            size="small"
            fullWidth
          />
          <Tooltip title={`Ordenar por data (${sortOrder === 'desc' ? 'mais recente' : 'mais antigo'})`}>
            <IconButton 
              onClick={handleToggleSort}
              sx={{ 
                flexShrink: 0,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {postsState.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Nenhum post encontrado.
        </Typography>
      ) : (
        <>
          <List>
            {postsState.map((post) => (
              <Paper
                key={post.id}
                elevation={2}
                sx={{ mb: 2, p: 2, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ListItem
                  disablePadding
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ cursor: 'pointer', flexGrow: 1 }}
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      {post.title}
                    </Typography>
                    {canManagePost(post) && (
                      <IconButton
                        edge="end"
                        aria-label="mais opções"
                        onClick={(e) => handleMenuClick(e, post)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                  <ListItemText
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      cursor: 'pointer',
                      maxWidth: '100%',
                      wordBreak: 'break-word'
                    }}
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/post/${post.id}`)}
                        dangerouslySetInnerHTML={createMarkup(post.content)}
                      />
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Por {post.author.name} em {formatDate(post.createdAt)}
                      </Typography>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditClick}>Editar</MenuItem>
            <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
              Excluir
            </MenuItem>
          </Menu>

          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
          >
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Cancelar</Button>
              <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                Excluir
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {user && (user.role === 'professor' || user.role === 'admin') && (
        <CreatePostButton
          color="primary"
          aria-label="Criar post"
          onClick={handleCreatePost}
        >
          <AddIcon />
        </CreatePostButton>
      )}
    </Container>
  );
};

export default PostList; 