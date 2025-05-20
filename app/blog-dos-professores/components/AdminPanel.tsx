import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { AuthUser, AdminPanelProps } from '@/types';
import AdminUserEdit from './AdminUserEdit';

export default function AdminPanel({ onClose, isDarkMode }: AdminPanelProps) {
  // Estados
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [userEditVisible, setUserEditVisible] = useState(false);

  // Hook de autenticação para obter o token
  const { token, user: currentUser } = useAuth();

  // Buscar usuários
  const fetchUsers = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (!token) {
        throw new Error('Você precisa estar logado como administrador');
      }

      const response = await fetch('http://localhost:4000/api/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro ao carregar usuários');
      }

      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Erro desconhecido ao carregar usuários';

      console.error('Erro ao carregar usuários:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Abrir modal de edição de usuário
  const handleUserPress = (user: AuthUser) => {
    // Certifique-se de que estamos passando o _id se disponível
    const selectedUserWithId = {
      ...user,
      _id: user._id || user.id // Garantir que _id está disponível
    };
    setSelectedUser(selectedUserWithId);
    setUserEditVisible(true);
  };

  // Fechar modal de edição de usuário
  const handleCloseUserEdit = () => {
    setUserEditVisible(false);
    setSelectedUser(null);
  };

  // Callback quando um usuário é atualizado
  const handleUserUpdated = () => {
    fetchUsers();
  };

  // Renderizar item de usuário
  const renderUserItem = ({ item }: { item: AuthUser }) => {
    // Não permitir que o admin atual se exclua
    const isCurrentUser = item.id === currentUser?.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.userItem,
          isDarkMode ? styles.userItemDark : styles.userItemLight,
          isCurrentUser && styles.currentUserItem,
        ]}
        onPress={() => handleUserPress(item)}
      >
        <View style={styles.userInfo}>
          <View style={styles.userNameRole}>
            <Text
              style={[
                styles.userName,
                isDarkMode ? styles.textDark : styles.textLight,
              ]}
            >
              {item.name}
            </Text>
            <View style={[
              styles.roleTag,
              item.role === 'admin' ? styles.adminTag : 
              item.role === 'professor' ? styles.professorTag : styles.alunoTag
            ]}>
              <Text style={styles.roleText}>
                {item.role === 'admin' ? 'Admin' : 
                 item.role === 'professor' ? 'Professor' : 'Aluno'}
              </Text>
            </View>
          </View>
          
          <Text
            style={[
              styles.userEmail,
              isDarkMode ? styles.userEmailDark : styles.userEmailLight,
            ]}
          >
            {item.email}
          </Text>
          
          {item.discipline && (
            <Text
              style={[
                styles.userDiscipline,
                isDarkMode ? styles.userDisciplineDark : styles.userDisciplineLight,
              ]}
            >
              Disciplina: {item.discipline}
            </Text>
          )}
        </View>
        
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDarkMode ? '#8e8e93' : '#c7c7cc'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={20}
        tint={isDarkMode ? "dark" : "light"}
        style={styles.overlay}
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
              Gerenciar Usuários
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
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchUsers()}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de usuários */}
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={isDarkMode ? '#fff' : '#007aff'}
              />
              <Text
                style={[
                  styles.loadingText,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}
              >
                Carregando usuários...
              </Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              contentContainerStyle={styles.userList}
              ListEmptyComponent={
                !loading && !error ? (
                  <View style={styles.emptyContainer}>
                    <Text
                      style={[
                        styles.emptyText,
                        isDarkMode ? styles.textDark : styles.textLight,
                      ]}
                    >
                      Nenhum usuário encontrado.
                    </Text>
                  </View>
                ) : null
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchUsers(true)}
                  tintColor={isDarkMode ? '#fff' : '#007aff'}
                />
              }
            />
          )}
        </View>
      </BlurView>

      {/* Modal de edição de usuário */}
      <AdminUserEdit
        visible={userEditVisible}
        onClose={handleCloseUserEdit}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
        isDarkMode={isDarkMode}
      />
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
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
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
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007aff',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  userList: {
    padding: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
  },
  userItemLight: {
    backgroundColor: '#f5f5f5',
  },
  userItemDark: {
    backgroundColor: '#1c1c1e',
  },
  currentUserItem: {
    borderWidth: 1,
    borderColor: '#007aff',
  },
  userInfo: {
    flex: 1,
  },
  userNameRole: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  adminTag: {
    backgroundColor: '#ff3b30',
  },
  professorTag: {
    backgroundColor: '#34c759',
  },
  alunoTag: {
    backgroundColor: '#007aff',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userEmailLight: {
    color: '#666',
  },
  userEmailDark: {
    color: '#8e8e93',
  },
  userDiscipline: {
    fontSize: 14,
  },
  userDisciplineLight: {
    color: '#666',
  },
  userDisciplineDark: {
    color: '#8e8e93',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
});