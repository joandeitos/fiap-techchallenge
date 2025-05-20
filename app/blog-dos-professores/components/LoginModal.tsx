import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { LoginModalProps } from '@/types';

const LoginModal: React.FC<LoginModalProps> = ({ onClose, isDarkMode }) => {
  // Estados para controle de exibição
  const [isRegistering, setIsRegistering] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Estados para registro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [registerRole, setRegisterRole] = useState<'admin' | 'professor' | 'aluno'>('aluno');
  const [registerDiscipline, setRegisterDiscipline] = useState('');
  
  // Estados para edição de perfil
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileRole, setProfileRole] = useState<'admin' | 'professor' | 'aluno'>('aluno');
  const [profileDiscipline, setProfileDiscipline] = useState('');
  
  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(false);
  
  // Contexto de autenticação
  const { user, isAuthenticated, login, register, logout, updateProfile, error, clearError } = useAuth();
  
  // Carregar dados do perfil ao entrar em modo de edição
  useEffect(() => {
    if (showProfileEdit && user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfileRole(user.role);
      setProfileDiscipline(user.discipline || '');
    }
  }, [showProfileEdit, user]);
  
  // Função para fazer login
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setIsLoading(true);
      await login(loginEmail, loginPassword);
      onClose();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      // O erro já é tratado no hook de autenticação
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para registrar novo usuário
  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword || !registerPasswordConfirm) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (registerPassword !== registerPasswordConfirm) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    
    try {
      setIsLoading(true);
      await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
        discipline: registerDiscipline,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao registrar:', error);
      // O erro já é tratado no hook de autenticação
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para atualizar perfil
  const handleUpdateProfile = async () => {
    if (!profileName || !profileEmail) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setIsLoading(true);
      await updateProfile({
        name: profileName,
        email: profileEmail,
        role: profileRole,
        discipline: profileDiscipline,
      });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      // O erro já é tratado no hook de autenticação
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para fazer logout
  const handleLogout = () => {
    logout();
    onClose();
  };
  
  // Renderizar formulário de login
  const renderLoginForm = () => {
    return (
      <View style={styles.formContainer}>
        <Text style={[
          styles.formTitle,
          isDarkMode ? styles.textDark : styles.textLight
        ]}>
          Login
        </Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
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
            placeholder="Seu e-mail"
            placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            value={loginEmail}
            onChangeText={setLoginEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[
            styles.label,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Senha
          </Text>
          <TextInput
            style={[
              styles.input,
              isDarkMode ? styles.inputDark : styles.inputLight
            ]}
            placeholder="Sua senha"
            placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            value={loginPassword}
            onChangeText={setLoginPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Logar</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            clearError();
            setIsRegistering(true);
          }}
        >
          <Text style={[
            styles.linkText,
            isDarkMode ? styles.linkTextDark : styles.linkTextLight
          ]}>
            Não tem uma conta? Registre-se
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Renderizar formulário de registro
  const renderRegisterForm = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={[
            styles.formTitle,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Registrar
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
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
              placeholder="Seu nome completo"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={registerName}
              onChangeText={setRegisterName}
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
              placeholder="Seu e-mail"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={registerEmail}
              onChangeText={setRegisterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              Senha
            </Text>
            <TextInput
              style={[
                styles.input,
                isDarkMode ? styles.inputDark : styles.inputLight
              ]}
              placeholder="Sua senha"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={registerPassword}
              onChangeText={setRegisterPassword}
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              Confirmar Senha
            </Text>
            <TextInput
              style={[
                styles.input,
                isDarkMode ? styles.inputDark : styles.inputLight
              ]}
              placeholder="Confirme sua senha"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={registerPasswordConfirm}
              onChangeText={setRegisterPasswordConfirm}
              secureTextEntry
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
                  registerRole === 'aluno' && styles.roleButtonActive,
                  isDarkMode ? styles.roleButtonDark : styles.roleButtonLight,
                ]}
                onPress={() => setRegisterRole('aluno')}
              >
                <Text style={[
                  styles.roleButtonText,
                  registerRole === 'aluno' && styles.roleButtonTextActive,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                  Aluno
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  registerRole === 'professor' && styles.roleButtonActive,
                  isDarkMode ? styles.roleButtonDark : styles.roleButtonLight,
                ]}
                onPress={() => setRegisterRole('professor')}
              >
                <Text style={[
                  styles.roleButtonText,
                  registerRole === 'professor' && styles.roleButtonTextActive,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                  Professor
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  registerRole === 'admin' && styles.roleButtonActive,
                  isDarkMode ? styles.roleButtonDark : styles.roleButtonLight,
                ]}
                onPress={() => setRegisterRole('admin')}
              >
                <Text style={[
                  styles.roleButtonText,
                  registerRole === 'admin' && styles.roleButtonTextActive,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              Disciplina (opcional)
            </Text>
            <TextInput
              style={[
                styles.input,
                isDarkMode ? styles.inputDark : styles.inputLight
              ]}
              placeholder="Sua disciplina"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={registerDiscipline}
              onChangeText={setRegisterDiscipline}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Registrar</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              clearError();
              setIsRegistering(false);
            }}
          >
            <Text style={[
              styles.linkText,
              isDarkMode ? styles.linkTextDark : styles.linkTextLight
            ]}>
              Já tem uma conta? Faça login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  
  // Renderizar formulário de edição de perfil
  const renderProfileForm = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={[
            styles.formTitle,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Editar Perfil
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
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
              placeholder="Seu nome completo"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={profileName}
              onChangeText={setProfileName}
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
              placeholder="Seu e-mail"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={profileEmail}
              onChangeText={setProfileEmail}
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
                  profileRole === 'aluno' && styles.roleButtonActive,
                  isDarkMode ? styles.roleButtonDark : styles.roleButtonLight,
                ]}
                onPress={() => setProfileRole('aluno')}
              >
                <Text style={[
                  styles.roleButtonText,
                  profileRole === 'aluno' && styles.roleButtonTextActive,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                  Aluno
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  profileRole === 'professor' && styles.roleButtonActive,
                  isDarkMode ? styles.roleButtonDark : styles.roleButtonLight,
                ]}
                onPress={() => setProfileRole('professor')}
              >
                <Text style={[
                  styles.roleButtonText,
                  profileRole === 'professor' && styles.roleButtonTextActive,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                  Professor
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  profileRole === 'admin' && styles.roleButtonActive,
                  isDarkMode ? styles.roleButtonDark : styles.roleButtonLight,
                ]}
                onPress={() => setProfileRole('admin')}
              >
                <Text style={[
                  styles.roleButtonText,
                  profileRole === 'admin' && styles.roleButtonTextActive,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              Disciplina (opcional)
            </Text>
            <TextInput
              style={[
                styles.input,
                isDarkMode ? styles.inputDark : styles.inputLight
              ]}
              placeholder="Sua disciplina"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={profileDiscipline}
              onChangeText={setProfileDiscipline}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Atualizar</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  
  // Renderizar conteúdo principal baseado no estado da autenticação
  const renderContent = () => {
    if (isAuthenticated) {
      if (showProfileEdit) {
        return renderProfileForm();
      }
      
      return (
        <View style={styles.profileContainer}>
          <Text style={[
            styles.profileHeader,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Perfil do Usuário
          </Text>
          
          {user && (
            <>
              <View style={styles.profileInfo}>
                <Text style={[
                  styles.profileLabel,
                  isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
                ]}>
                  Nome:
                </Text>
                <Text style={[
                  styles.profileValue,
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  {user.name}
                </Text>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={[
                  styles.profileLabel,
                  isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
                ]}>
                  E-mail:
                </Text>
                <Text style={[
                  styles.profileValue,
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  {user.email}
                </Text>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={[
                  styles.profileLabel,
                  isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
                ]}>
                  Função:
                </Text>
                <Text style={[
                  styles.profileValue,
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  {user.role === 'admin' ? 'Administrador' : 
                   user.role === 'professor' ? 'Professor' : 'Aluno'}
                </Text>
              </View>
              
              {user.discipline && (
                <View style={styles.profileInfo}>
                  <Text style={[
                    styles.profileLabel,
                    isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
                  ]}>
                    Disciplina:
                  </Text>
                  <Text style={[
                    styles.profileValue,
                    isDarkMode ? styles.textDark : styles.textLight
                  ]}>
                    {user.discipline}
                  </Text>
                </View>
              )}
            </>
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setShowProfileEdit(true)}
          >
            <Text style={styles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return isRegistering ? renderRegisterForm() : renderLoginForm();
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight
      ]}>
        <View style={styles.header}>
          <Text style={[
            styles.headerTitle,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            {isAuthenticated 
              ? 'Sua Conta' 
              : isRegistering 
                ? 'Criar Conta' 
                : 'Login'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
        
        {renderContent()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#f5f5f5',
  },
  mutedTextLight: {
    color: '#666',
  },
  mutedTextDark: {
    color: '#aaa',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  button: {
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2196f3',
  },
  secondaryButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    fontSize: 14,
  },
  linkTextLight: {
    color: '#2196f3',
  },
  linkTextDark: {
    color: '#64b5f6',
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
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  profileContainer: {
    padding: 16,
  },
  profileHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileLabel: {
    fontSize: 16,
    width: 100,
  },
  profileValue: {
    fontSize: 16,
    flex: 1,
  },
});

export default LoginModal;