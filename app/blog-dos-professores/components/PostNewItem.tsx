import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

interface PostNewItemProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  isDarkMode: boolean;
}

export default function PostNewItem({
  visible,
  onClose,
  onPostCreated,
  isDarkMode,
}: PostNewItemProps) {
  // Estados do formulário
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook de autenticação para obter o token
  const { token } = useAuth();

  // Validar o formulário
  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Erro', 'O título é obrigatório');
      return false;
    }

    if (!content.trim()) {
      Alert.alert('Erro', 'O conteúdo é obrigatório');
      return false;
    }

    return true;
  };

  // Limpar o formulário
  const clearForm = () => {
    setTitle('');
    setContent('');
    setError(null);
  };

  // Enviar post para a API
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('Você precisa estar logado para criar um post');
      }

      const response = await fetch('http://localhost:4000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro ao criar post');
      }

      // Limpar formulário e fechar modal
      clearForm();
      onPostCreated(); // Callback para atualizar a lista de posts
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Erro desconhecido ao criar post';

      console.error('Erro ao criar post:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar e fechar modal
  const handleCancel = () => {
    clearForm();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
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
                Novo Post
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
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
              {/* Título */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  Título
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    isDarkMode ? styles.inputDark : styles.inputLight,
                  ]}
                  placeholder="Digite o título do post"
                  placeholderTextColor={isDarkMode ? '#8e8e93' : '#c7c7cc'}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                  editable={!loading}
                />
              </View>

              {/* Conteúdo */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  Conteúdo
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    isDarkMode ? styles.inputDark : styles.inputLight,
                  ]}
                  placeholder="Digite o conteúdo do post"
                  placeholderTextColor={isDarkMode ? '#8e8e93' : '#c7c7cc'}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                  editable={!loading}
                />
              </View>
            </ScrollView>

            {/* Botões de ação */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Incluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
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
    maxWidth: 600,
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
    maxHeight: 400,
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
  textArea: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingTop: 12,
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
  cancelButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007aff',
  },
  submitButton: {
    marginLeft: 8,
    backgroundColor: '#007aff',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
});