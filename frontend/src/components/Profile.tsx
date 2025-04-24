import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { User } from '../types/user';

interface ProfileData {
  name: string;
  email: string;
  role?: string;
  discipline?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'aluno',
    discipline: user?.discipline || 'Not Defined',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (formData.role === 'professor' && (!formData.discipline || formData.discipline.trim() === '')) {
      errors.discipline = 'A disciplina é obrigatória para professores';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const updateData: Partial<ProfileData> = {
        name: formData.name,
      };

      // Apenas admin pode atualizar o e-mail
      if (user?.role === 'admin') {
        updateData.email = formData.email;
      }

      // Se estiver mudando para professor, inclui a disciplina
      if (formData.role === 'professor') {
        updateData.role = 'professor';
        updateData.discipline = formData.discipline || 'Not Defined';
      } else if (formData.role) {
        updateData.role = formData.role;
        updateData.discipline = undefined;
      }

      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put<User>(
        `/api/users/profile/${user?.id}`,
        updateData
      );
      updateUser(response.data);
      setSuccess('Perfil atualizado com sucesso!');
      
      // Limpa os campos de senha
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', {
        error,
        requestData: formData,
        userId: user?.id
      });
      if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erro ao atualizar o perfil. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Meu Perfil
        </Typography>

        <Paper sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={user?.role !== 'admin'}
                  helperText={user?.role !== 'admin' ? 'Apenas administradores podem alterar o e-mail' : ''}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Papel</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleSelectChange}
                    label="Papel"
                  >
                    <MenuItem value="aluno">Aluno</MenuItem>
                    <MenuItem value="professor">Professor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.role === 'professor' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Disciplina"
                    name="discipline"
                    value={formData.discipline}
                    onChange={handleInputChange}
                    required
                    error={!!formErrors.discipline}
                    helperText={formErrors.discipline || "Campo obrigatório para professores"}
                    placeholder="Not Defined"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Alterar Senha
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Senha Atual"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword || ''}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nova Senha"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword || ''}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirmar Nova Senha"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword || ''}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 