import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostDetailProps } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

// Importamos WebView de forma condicional para evitar erros na web
let WebView: any = null;
try {
  if (Platform.OS !== 'web') {
    WebView = require('react-native-webview').WebView;
  }
} catch (error) {
  console.warn('WebView não disponível na plataforma atual.');
}

const PostDetail: React.FC<PostDetailProps> = ({ 
  post, 
  onClose, 
  canEdit, 
  canDelete,
  isDarkMode 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtém o token de autenticação
  const { token } = useAuth();

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  };

  // HTML para renderizar em modo escuro
  const getHtmlContent = () => {
    const darkModeStyle = isDarkMode 
      ? '<style>body { background-color: #2a2a2a; color: #f5f5f5; }</style>' 
      : '';
      
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${darkModeStyle}
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 16px;
              margin: 0;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
  };

  // Função para atualizar post
  const handleUpdatePost = async () => {
    try {
      setIsLoading(true);
      
      if (!token) {
        throw new Error('Não autenticado. Faça login novamente.');
      }
      
      console.log('Atualizando post', post.id, 'com token:', token.substring(0, 10) + '...');
      
      const response = await fetch(`http://localhost:4000/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao atualizar post:', errorData);
        throw new Error(errorData.message || 'Falha ao atualizar o post');
      }

      Alert.alert('Sucesso', 'Post atualizado com sucesso!');
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Erro completo:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao atualizar o post');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para deletar post
  const handleDeletePost = async () => {
    try {
      setIsLoading(true);
      
      if (!token) {
        throw new Error('Não autenticado. Faça login novamente.');
      }
      
      console.log('Excluindo post', post.id, 'com token:', token.substring(0, 10) + '...');
      
      const response = await fetch(`http://localhost:4000/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao excluir post:', errorData);
        throw new Error(errorData.message || 'Falha ao excluir o post');
      }

      Alert.alert('Sucesso', 'Post excluído com sucesso!');
      setIsDeleteConfirmVisible(false);
      onClose();
    } catch (error) {
      console.error('Erro completo:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao excluir o post');
      setIsDeleteConfirmVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderiza conteúdo HTML de maneira segura em todas as plataformas
  const renderHtmlContent = () => {
    if (Platform.OS === 'web') {
      return (
        <View 
          style={[
            styles.webViewContainer,
            { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }
          ]}
        >
          <div 
            style={{
              padding: 16,
              color: isDarkMode ? '#f5f5f5' : '#333',
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
              height: '100%',
              overflow: 'auto'
            }}
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </View>
      );
    }
    
    if (WebView) {
      return (
        <View style={styles.webViewContainer}>
          <WebView
            originWhitelist={['*']}
            source={{ html: getHtmlContent() }}
            style={styles.webView}
          />
        </View>
      );
    }
    
    // Fallback para plataformas sem WebView
    return (
      <View style={styles.fallbackContainer}>
        <Text style={isDarkMode ? styles.textDark : styles.textLight}>
          Não é possível renderizar o conteúdo HTML nesta plataforma.
        </Text>
        <Text style={[
          styles.fallbackContent,
          isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
        ]}>
          {content.replace(/<[^>]+>/g, ' ')}
        </Text>
      </View>
    );
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
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            {canEdit && !isEditing && (
              <TouchableOpacity 
                onPress={() => setIsEditing(true)}
                style={[styles.actionButton, styles.editButton]}
              >
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
            )}
            
            {canEdit && isEditing && (
              <TouchableOpacity 
                onPress={handleUpdatePost}
                style={[styles.actionButton, styles.confirmButton]}
                disabled={isLoading}
              >
                <Text style={styles.actionButtonText}>
                  {isLoading ? 'Salvando...' : 'Confirmar Edição'}
                </Text>
              </TouchableOpacity>
            )}
            
            {canDelete && !isEditing && (
              <TouchableOpacity 
                onPress={() => setIsDeleteConfirmVisible(true)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={styles.actionButtonText}>Deletar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <ScrollView style={styles.content}>
          {isEditing ? (
            <View style={styles.editForm}>
              <Text style={[
                styles.label,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Título
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Título do post"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              />
              
              <Text style={[
                styles.label,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Conteúdo (HTML)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={content}
                onChangeText={setContent}
                placeholder="Conteúdo do post (HTML)"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
            </View>
          ) : (
            <>
              <Text style={[
                styles.title,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {post.title}
              </Text>
              
              <View style={styles.meta}>
                <Text style={[
                  styles.metaText,
                  isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
                ]}>
                  Por: {post.author.name}
                </Text>
                <Text style={[
                  styles.metaText,
                  isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
                ]}>
                  {formatDate(post.createdAt)}
                </Text>
              </View>
              
              {renderHtmlContent()}
            </>
          )}
        </ScrollView>
        
        {/* Modal de confirmação para excluir */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isDeleteConfirmVisible}
          onRequestClose={() => setIsDeleteConfirmVisible(false)}
        >
          <View style={styles.confirmModalContainer}>
            <View style={[
              styles.confirmModal,
              isDarkMode ? styles.confirmModalDark : styles.confirmModalLight
            ]}>
              <Text style={[
                styles.confirmModalTitle,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Confirmar exclusão
              </Text>
              
              <Text style={[
                styles.confirmModalText,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
              </Text>
              
              <View style={styles.confirmModalButtons}>
                <TouchableOpacity
                  style={[styles.confirmModalButton, styles.cancelButton]}
                  onPress={() => setIsDeleteConfirmVisible(false)}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmModalButtonText}>Desistir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.confirmModalButton, styles.confirmButton]}
                  onPress={handleDeletePost}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmModalButtonText}>
                    {isLoading ? 'Excluindo...' : 'Confirmar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#f5f5f5',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
  },
  mutedTextLight: {
    color: '#666',
  },
  mutedTextDark: {
    color: '#aaa',
  },
  webViewContainer: {
    flex: 1,
    height: 500, // Altura fixa para evitar problemas de tamanho
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallbackContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 200,
  },
  fallbackContent: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  editForm: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 16,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    minHeight: 200,
  },
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmModal: {
    width: '80%',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  confirmModalLight: {
    backgroundColor: '#fff',
  },
  confirmModalDark: {
    backgroundColor: '#333',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  confirmModalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  confirmModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PostDetail;