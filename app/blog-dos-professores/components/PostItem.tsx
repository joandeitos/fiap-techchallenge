import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PostItemProps } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PostItem: React.FC<PostItemProps> = ({ post, onPress, isDarkMode }) => {
  // Função para formatar a data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  };

  // Função para remover tags HTML e limitar caracteres
  const truncateContent = (htmlContent: string, maxLength: number = 60) => {
    // Remove tags HTML
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    
    // Limita o tamanho e adiciona '...' se necessário
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.title,
        isDarkMode ? styles.textDark : styles.textLight,
      ]}>
        {post.title}
      </Text>
      
      <Text style={[
        styles.content,
        isDarkMode ? styles.textDark : styles.textLight,
      ]}>
        {truncateContent(post.content)}
      </Text>
      
      <View style={styles.footer}>
        <Text style={[
          styles.date,
          isDarkMode ? styles.mutedTextDark : styles.mutedTextLight,
        ]}>
          {formatDate(post.createdAt)}
        </Text>
        
        <Text style={[
          styles.author,
          isDarkMode ? styles.mutedTextDark : styles.mutedTextLight,
        ]}>
          Por: {post.author.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  containerLight: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#2a2a2a',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#f5f5f5',
  },
  content: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  author: {
    fontSize: 12,
    fontWeight: '500',
  },
  mutedTextLight: {
    color: '#666',
  },
  mutedTextDark: {
    color: '#aaa',
  },
});

export default PostItem;