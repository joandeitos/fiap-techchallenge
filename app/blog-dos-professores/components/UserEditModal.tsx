import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthUser } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface UserEditModalProps {
  user: AuthUser;
  onClose: () => void;
  onUserUpdated: () => void;
  isDarkMode: boolean;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ 
  user, 
  onClose, 
  onUserUpdated,
  isDarkMode 
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<'admin' | 'professor' | 'aluno'>(user.role);
  const [discipline, setDiscipline] = useState(user.discipline || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtém o token de autenticação
  const { token } = useAuth();
  
  // Limpar a disciplina quando o papel não for professor
  useEffect(() => {
    if (role !== 'professor') {
      setDiscipline('');
    }
  }, [role]);

  // Função para atualizar usuário
  const handleUpdateUser = async () => {
    if (!name || !email) {
      Alert.alert('Erro', 'Nome e e-mail são campos obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      
      if (!token) {
        throw new Error('Não autenticado. Faça login novamente.');
      }
      
      // Preparar dados para envio - só inclui disciplina se for professor
      const userData: any = {
        name,
        email,
        role,
      };
      
      // Apenas incluir disciplina se for professor
      if (role === 'professor' && discipline) {
        userData.discipline = discipline;
      }
      
      const response = await fetch(`http://localhost:4000/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar usuário');
      }

      const data = await response.json();
      
      // Log da resposta para verificar os dados atualizados
      console.log('Usuário atualizado com sucesso:', data);
      
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso', [
        { 
          text: 'OK', 
          onPress: () => {
            // Notificar que houve atualização e depois fechar o modal
            onUserUpdated();
          } 
        }
      ]);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao atualizar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          isDarkMode ? styles.modalContainerDark : styles.modalContainerLight
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              Editar Usuário
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Nome
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                placeholder="Nome completo"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                E-mail
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                placeholder="E-mail"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Função
              </Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'aluno' && styles.roleButtonActive,
                    isDarkMode ? styles.roleButtonDark : styles.roleButtonLight,
                  ]}
                  onPress={() => setRole('aluno')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === 'aluno' && styles.roleButtonTextActive,
                    isDarkMode ? styles.textDark : styles.textLight,
                  ]}>
                    Aluno
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'professor' && styles.roleButtonActive,
                    isDarkMode ? styles.roleButtonDark : styles.roleButtonLight,
                  ]}
                  onPress={() => setRole('professor')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === 'professor' && styles.roleButtonTextActive,
                    isDarkMode ? styles.textDark : styles.textLight,
                  ]}>
                    Professor
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'admin' && styles.roleButtonActive,
                    isDarkMode ? styles.roleButtonDark : styles.roleButtonLight,
                  ]}
                  onPress={() => setRole('admin')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === 'admin' && styles.roleButtonTextActive,
                    isDarkMode ? styles.textDark : styles.textLight,
                  ]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo Disciplina - apenas visível para professores */}
            {role === 'professor' && (
              <View style={styles.inputGroup}>
                <Text style={[
                  styles.label,
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  Disciplina
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    isDarkMode ? styles.inputDark : styles.inputLight
                  ]}
                  placeholder="Disciplina lecionada"
                  placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                  value={discipline}
                  onChangeText={setDiscipline}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={handleUpdateUser}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContainerLight: {
    backgroundColor: '#fff',
  },
  modalContainerDark: {
    backgroundColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#f5f5f5',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#f5f5f5',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  roleButtonLight: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  roleButtonDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  roleButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  roleButtonText: {
    fontSize: 14,
  },
  roleButtonTextActive: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserEditModal;