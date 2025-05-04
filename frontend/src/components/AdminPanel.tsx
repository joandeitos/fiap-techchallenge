import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableSortLabel,
  InputAdornment,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Author {
  _id: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'aluno';
  discipline?: string;
}

type Order = 'asc' | 'desc';

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [token] = useState(localStorage.getItem('token'));
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editedUserName, setEditedUserName] = useState('');
  const [editedUserEmail, setEditedUserEmail] = useState('');
  const [editedUserRole, setEditedUserRole] = useState<'admin' | 'professor' | 'aluno'>('professor');
  const [editedUserDiscipline, setEditedUserDiscipline] = useState('Not Defined');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'post' | 'user'; title?: string; name?: string } | null>(null);
  
  // Estados para ordenação e busca
  const [postOrder, setPostOrder] = useState<Order>('desc');
  const [postOrderBy, setPostOrderBy] = useState<string>('createdAt');
  const [userOrder, setUserOrder] = useState<Order>('asc');
  const [userOrderBy, setUserOrderBy] = useState<string>('name');
  const [postSearch, setPostSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormErrors, setUserFormErrors] = useState<Record<string, string>>({});

  const fetchPosts = async () => {
    try {
      const response = await axios.get<Post[]>('/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar a lista de usuários. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, [token]);

  const handleDeleteClick = (id: string, type: 'post' | 'user', title?: string, name?: string) => {
    //console.log('ID do post a ser excluído:', id);
    //console.log('Tipo:', type);
    //console.log('Título:', title);
    setItemToDelete({ id, type, title, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'post') {
        const token = localStorage.getItem('token');
        
        //console.log('Token:', token);
        //console.log('ID do post a ser excluído:', itemToDelete.id);

        if (!itemToDelete.id) {
          setError('ID do post não encontrado');
          return;
        }

        await axios.delete(`/api/posts/${itemToDelete.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setError('');
        fetchPosts();
      } else {
        await axios.delete(`/api/users/${itemToDelete.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setError('');
        fetchUsers();
      }
    } catch (error) {
      console.error(`Erro ao deletar ${itemToDelete.type}:`, error);
      setError(`Erro ao deletar ${itemToDelete.type}. Por favor, tente novamente.`);
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleEditPost = (post: Post) => {
    setEditPost(post);
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setOpenDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editPost) return;

    try {
      await axios.put(
        `/api/posts/${editPost.id}`,
        {
          title: editedTitle,
          content: editedContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOpenDialog(false);
      fetchPosts();
    } catch (error) {
      console.error('Erro ao editar post:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setEditedUserName(user.name);
    setEditedUserEmail(user.email);
    setEditedUserRole(user.role);
    setEditedUserDiscipline(user.discipline || 'Not Defined');
    setOpenUserDialog(true);
    setUserFormErrors({});
  };

  const validateUserForm = () => {
    const errors: Record<string, string> = {};
    
    if (editedUserRole === 'professor') {
      if (!editedUserDiscipline || editedUserDiscipline.trim() === '') {
        errors.discipline = 'A disciplina é obrigatória para professores';
      }
    }

    setUserFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRoleChange = (e: SelectChangeEvent<'admin' | 'professor' | 'aluno'>) => {
    const newRole = e.target.value as 'admin' | 'professor' | 'aluno';
    setEditedUserRole(newRole);
    
    if (newRole === 'professor') {
      setEditedUserDiscipline('Not Defined');
      // Valida imediatamente quando muda para professor
      validateUserForm();
    } else {
      setEditedUserDiscipline('');
      setUserFormErrors({});
    }
  };

  const handleDisciplineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedUserDiscipline(value);
    // Valida imediatamente quando o valor muda
    if (editedUserRole === 'professor') {
      validateUserForm();
    }
  };

  const handleSaveUserEdit = async () => {
    if (!editUser) return;

    if (!validateUserForm()) {
      return;
    }

    try {
      await axios.put(
        `/api/users/${editUser._id}`,
        {
          name: editedUserName,
          email: editedUserEmail,
          role: editedUserRole,
          ...(editedUserRole === 'professor' ? { discipline: editedUserDiscipline || 'Not Defined' } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOpenUserDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
    }
  };

  const handleRequestSort = (property: string, isPost: boolean = true) => {
    if (isPost) {
      setPostOrder(postOrderBy === property && postOrder === 'asc' ? 'desc' : 'asc');
      setPostOrderBy(property);
    } else {
      setUserOrder(userOrderBy === property && userOrder === 'asc' ? 'desc' : 'asc');
      setUserOrderBy(property);
    }
  };

  const filterAndSortPosts = (items: Post[]) => {
    let filtered = items;
    
    // Filtrar
    if (postSearch) {
      const searchLower = postSearch.toLowerCase();
      filtered = items.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.author.name.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar
    return filtered.sort((a, b) => {
      const order = postOrder === 'asc' ? 1 : -1;
      
      if (postOrderBy === 'title') {
        return order * a.title.localeCompare(b.title);
      }
      if (postOrderBy === 'author') {
        return order * a.author.name.localeCompare(b.author.name);
      }
      if (postOrderBy === 'createdAt') {
        return order * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return 0;
    });
  };

  const filterAndSortUsers = (items: User[]) => {
    let filtered = items;
    
    // Filtrar
    if (userSearch) {
      const searchLower = userSearch.toLowerCase();
      filtered = items.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        (user.discipline || '').toLowerCase().includes(searchLower)
      );
    }

    // Ordenar
    return filtered.sort((a, b) => {
      const order = userOrder === 'asc' ? 1 : -1;
      
      if (userOrderBy === 'name') {
        return order * a.name.localeCompare(b.name);
      }
      if (userOrderBy === 'email') {
        return order * a.email.localeCompare(b.email);
      }
      if (userOrderBy === 'role') {
        return order * a.role.localeCompare(b.role);
      }
      if (userOrderBy === 'discipline') {
        return order * ((a.discipline || '').localeCompare(b.discipline || ''));
      }
      return 0;
    });
  };

  const sortedAndFilteredPosts = React.useMemo(() => filterAndSortPosts(posts), [posts, postOrder, postOrderBy, postSearch]);
  const sortedAndFilteredUsers = React.useMemo(() => filterAndSortUsers(users), [users, userOrder, userOrderBy, userSearch]);

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel Administrativo
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Posts" />
          <Tab label="Usuários" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar posts..."
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={postOrderBy === 'title'}
                      direction={postOrderBy === 'title' ? postOrder : 'asc'}
                      onClick={() => handleRequestSort('title')}
                    >
                      Título
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={postOrderBy === 'author'}
                      direction={postOrderBy === 'author' ? postOrder : 'asc'}
                      onClick={() => handleRequestSort('author')}
                    >
                      Autor
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={postOrderBy === 'createdAt'}
                      direction={postOrderBy === 'createdAt' ? postOrder : 'asc'}
                      onClick={() => handleRequestSort('createdAt')}
                    >
                      Data
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAndFilteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.author.name || post.author.email}</TableCell>
                    <TableCell>
                      {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditPost(post)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(post.id, 'post', post.title)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar usuários..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={userOrderBy === 'email'}
                      direction={userOrderBy === 'email' ? userOrder : 'asc'}
                      onClick={() => handleRequestSort('email', false)}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={userOrderBy === 'name'}
                      direction={userOrderBy === 'name' ? userOrder : 'asc'}
                      onClick={() => handleRequestSort('name', false)}
                    >
                      Nome
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={userOrderBy === 'role'}
                      direction={userOrderBy === 'role' ? userOrder : 'asc'}
                      onClick={() => handleRequestSort('role', false)}
                    >
                      Função
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={userOrderBy === 'discipline'}
                      direction={userOrderBy === 'discipline' ? userOrder : 'asc'}
                      onClick={() => handleRequestSort('discipline', false)}
                    >
                      Disciplina
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAndFilteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      {user.role === 'admin' ? 'Administrador' : user.role === 'professor' ? 'Professor' : 'Aluno'}
                    </TableCell>
                    <TableCell>{user.discipline || '-'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditUser(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          console.log(user);
                          handleDeleteClick(user._id, 'user', undefined, user.name || user.email)}
                        } 
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Editar Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título"
            fullWidth
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Conteúdo"
            fullWidth
            multiline
            rows={4}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            value={editedUserName}
            onChange={(e) => setEditedUserName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={editedUserEmail}
            onChange={(e) => setEditedUserEmail(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Função</InputLabel>
            <Select
              value={editedUserRole}
              onChange={handleRoleChange}
            label="Função"
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="professor">Professor</MenuItem>
              <MenuItem value="aluno">Aluno</MenuItem>
            </Select>
          </FormControl>
          {editedUserRole === 'professor' && (
            <FormControl fullWidth margin="dense" error={!!userFormErrors.discipline}>
            <TextField
              label="Disciplina"
              value={editedUserDiscipline}
                onChange={handleDisciplineChange}
                error={!!userFormErrors.discipline}
                helperText={userFormErrors.discipline || "Campo obrigatório para professores"}
                required
                InputLabelProps={{
                  shrink: true,
                }}
            />
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveUserEdit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            {itemToDelete?.type === 'post' 
              ? `Tem certeza que deseja excluir o post "${itemToDelete.title}"?`
              : `Tem certeza que deseja excluir o usuário "${itemToDelete?.name}"?`
            }
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default AdminPanel; 