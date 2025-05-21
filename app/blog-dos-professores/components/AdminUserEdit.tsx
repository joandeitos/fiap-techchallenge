import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { AuthUser } from '@/types';

// Interface local para o componente
interface UserEditProps {
  visible: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: (AuthUser & { _id?: string }) | null;
  isDarkMode: boolean;
}

interface AdminUserEditProps {
  visible: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: AuthUser | null;
  isDarkMode: boolean;
}

export default function AdminUserEdit({
  visible,
  onClose,
  onUserUpdated,
  user,
  isDarkMode,
}: UserEditProps) {
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'professor' | 'aluno'>('aluno');
  const [discipline, setDiscipline] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  // Hook de autenticação para obter o token
  const { token } = useAuth();

  // Carregar dados do usuário quando o componente for montado ou quando o usuário mudar
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || 'aluno');
      setDiscipline(user.discipline || '');
      setIsActive(true); // Assumindo que usuários disponíveis para edição estão ativos
      setError(null);
    }
  }, [user]);

  // Validar o formulário
  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'O e-mail é obrigatório');
      return false;
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido');
      return false;
    }

    if (role === 'professor' && !discipline.trim()) {
      Alert.alert('Erro', 'A disciplina é obrigatória para professores');
      return false;
    }

    return true;
  };

  // Atualizar usuário
  const handleUpdateUser = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('Você precisa estar logado como administrador');
      }

      if (!user?._id && !user?.id) {
        throw new Error('ID de usuário não encontrado');
      }

      // Usar _id se disponível, caso contrário usar id
      const userId = user._id || user.id;

      const userData = {
        name,
        email,
        role,
        discipline: role === 'professor' ? discipline : undefined,
        isActive,
      };

      const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro ao atualizar usuário');
      }

      Alert.alert('Sucesso', 'Usuário atualizado com sucesso');
      onUserUpdated();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Erro desconhecido ao atualizar usuário';

      console.error('Erro ao atualizar usuário:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Excluir usuário
  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('Você precisa estar logado como administrador');
      }

      if (!user?._id && !user?.id) {
        throw new Error('ID de usuário não encontrado');
      }

      // Usar _id se disponível, caso contrário usar id
      const userId = user._id || user.id;

      const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro ao excluir usuário');
      }

      Alert.alert('Sucesso', 'Usuário excluído com sucesso');
      setIsDeleteConfirmVisible(false);
      onUserUpdated();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Erro desconhecido ao excluir usuário';

      console.error('Erro ao excluir usuário:', err);
      setError(errorMessage);
      setIsDeleteConfirmVisible(false);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar confirmação de exclusão
  const confirmDeleteUser = () => {
    setIsDeleteConfirmVisible(true);
  };

  // Cancelar exclusão
  const cancelDeleteUser = () => {
    setIsDeleteConfirmVisible(false);
  };

  if (!visible || !user) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={20}
        tint={isDarkMode ? "dark" : "light"}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View
            style={[
              styles.container,
              isDarkMode ? styles.containerDark : styles.containerLight,
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text
                style={[
                  styles.headerTitle,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}
              >
                Editar Usuário
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkMode ? '#fff' : '#000'}
                />
              </TouchableOpacity>
            </View>

            {/* Mensagem de erro */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Formulário */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
            >
              {/* Nome */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  Nome
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    isDarkMode ? styles.inputDark : styles.inputLight,
                  ]}
                  placeholder="Nome do usuário"
                  placeholderTextColor={isDarkMode ? '#8e8e93' : '#c7c7cc'}
                  value={name}
                  onChangeText={setName}
                  maxLength={100}
                  editable={!loading}
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  E-mail
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    isDarkMode ? styles.inputDark : styles.inputLight,
                  ]}
                  placeholder="E-mail do usuário"
                  placeholderTextColor={isDarkMode ? '#8e8e93' : '#c7c7cc'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Tipo de Usuário */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  Tipo de Usuário
                </Text>
                <View style={styles.roleToggle}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'admin' && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole('admin')}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'admin' && styles.roleButtonTextActive,
                      ]}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'professor' && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole('professor')}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'professor' && styles.roleButtonTextActive,
                      ]}
                    >
                      Professor
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'aluno' && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole('aluno')}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'aluno' && styles.roleButtonTextActive,
                      ]}
                    >
                      Aluno
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Disciplina (apenas para professores) */}
              {role === 'professor' && (
                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.inputLabel,
                      isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                    ]}
                  >
                    Disciplina
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isDarkMode ? styles.inputDark : styles.inputLight,
                    ]}
                    placeholder="Disciplina do professor"
                    placeholderTextColor={isDarkMode ? '#8e8e93' : '#c7c7cc'}
                    value={discipline}
                    onChangeText={setDiscipline}
                    editable={!loading}
                  />
                </View>
              )}

              {/* Status */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  Ativo
                </Text>
                <View style={styles.switchContainer}>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    disabled={loading}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isActive ? '#007aff' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                  />
                  <Text
                    style={[
                      styles.switchText,
                      isDarkMode ? styles.textDark : styles.textLight,
                    ]}
                  >
                    {isActive ? 'Sim' : 'Não'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Botões de Ação */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={confirmDeleteUser}
                disabled={loading}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleUpdateUser}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteConfirmVisible && (
        <Modal
          transparent
          visible={isDeleteConfirmVisible}
          animationType="fade"
          onRequestClose={cancelDeleteUser}
        >
          <BlurView
            intensity={40}
            tint={isDarkMode ? "dark" : "light"}
            style={styles.overlay}
          >
            <View
              style={[
                styles.confirmDialog,
                isDarkMode ? styles.confirmDialogDark : styles.confirmDialogLight,
              ]}
            >
              <Text
                style={[
                  styles.confirmTitle,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}
              >
                Confirmar Exclusão
              </Text>
              <Text
                style={[
                  styles.confirmMessage,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}
              >
                Tem certeza que deseja excluir o usuário {user.name}? Esta ação não pode ser desfeita.
              </Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.cancelButton]}
                  onPress={cancelDeleteUser}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.confirmDeleteButton, loading && styles.buttonDisabled]}
                  onPress={handleDeleteUser}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmDeleteText}>Excluir</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  keyboardAvoidingView: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#2c2c2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  scrollView: {
    maxHeight: 600,
  },
  scrollViewContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputLabelLight: {
    color: '#333',
  },
  inputLabelDark: {
    color: '#f5f5f5',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#1c1c1e',
    borderColor: '#3a3a3c',
    color: '#fff',
  },
  roleToggle: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  roleButtonText: {
    color: '#ff3b30',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    marginLeft: 8,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginLeft: 8,
    backgroundColor: '#007aff',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  confirmDialog: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 16,
  },
  confirmDialogLight: {
    backgroundColor: '#fff',
  },
  confirmDialogDark: {
    backgroundColor: '#2c2c2e',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  confirmMessage: {
    fontSize: 16,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    backgroundColor: '#ff3b30',
  },
  confirmDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});