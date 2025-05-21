import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Post } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import PostItem from '@/components/PostItem';
import PostDetail from '@/components/PostDetail';
import SideMenu from '@/components/SideMenu';
import LoginModal from '@/components/LoginModal';
import OptionsModal from '@/components/OptionsModal';
import AboutModal from '@/components/AboutModal';
import AdminPanel from '@/components/AdminPanel';
import PostNewItem from '@/components/PostNewItem';

export default function HomeScreen() {

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalType, setModalType] = useState<'login' | 'options' | 'about' | 'admin' | null>(null);
  const [newPostModalVisible, setNewPostModalVisible] = useState(false);
  

  const { colorScheme } = useColorScheme();
  const { user, isAuthenticated } = useAuth();
  

  const isDarkMode = colorScheme === 'dark';
  const isAdmin = user?.role === 'admin';
  const canEdit = isAuthenticated && (user?.role === 'admin' || user?.role === 'professor');
  const canCreatePost = isAuthenticated && (user?.role === 'admin' || user?.role === 'professor');
  const { token } = useAuth(); 
  

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:4000/api/posts', {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Falha ao carregar posts');
      }
      
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError('Erro ao carregar posts. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  const searchPosts = async () => {
    if (!searchTerm.trim()) {
      fetchPosts();
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      

      try {
        const response = await fetch(`http://localhost:4000/api/posts/search?q=${encodeURIComponent(searchTerm)}`, {
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
          setIsSearching(false);
          return; 
        }
      } catch (err) {
        console.warn("Busca pela API falhou, usando busca local");

      }
      

      const response = await fetch('http://localhost:4000/api/posts', {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Falha ao carregar posts para busca local');
      }
      
      const allPosts = await response.json();
      

      const lowercaseSearchTerm = searchTerm.toLowerCase();
      const filteredPosts = allPosts.filter((post: Post) => 
        post.title.toLowerCase().includes(lowercaseSearchTerm) || 
        post.content.toLowerCase().includes(lowercaseSearchTerm) ||
        post.author.name.toLowerCase().includes(lowercaseSearchTerm)
      );
      
      setPosts(filteredPosts);
    } catch (err) {
      setError('Erro ao buscar posts. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };
  

  useEffect(() => {
    fetchPosts();
  }, []);
  

  const handleMenuPress = () => {
    setMenuVisible(!menuVisible);
  };
  
  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
  };
  
  const handleClosePostDetail = () => {
    setSelectedPost(null);
    fetchPosts(); 
  };
  
  const handleMenuItemPress = (type: 'login' | 'options' | 'about' | 'admin') => {
    setModalType(type);
    setMenuVisible(false);
  };
  
  const handleCloseModal = () => {
    setModalType(null);
    if (modalType === 'login') {
      fetchPosts();
    }
  };


  const handleNewPostPress = () => {
    setNewPostModalVisible(true);
  };
  

  const handleCloseNewPostModal = () => {
    setNewPostModalVisible(false);
  };


  const handlePostCreated = () => {
    fetchPosts(); 
  };
  

  const renderHeader = () => {

    const headerBackgroundColor = isAdmin 
      ? (isDarkMode ? '#8B0000' : '#E53935') // Bordô para dark, vermelho para light 
      : '#000000';
    
    return (
      <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
        <View style={styles.headerLeft}>
          {isAdmin ? (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => handleMenuItemPress('admin')}
            >
              <Text style={styles.adminButtonText}>Controle de Usuários</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => fetchPosts()}>
              <Text style={styles.headerTitle}>Blog dos Professores</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.headerCenter}>
          {isAdmin && (
            <Text style={styles.headerTitle}>Admin</Text>
          )}
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderSearchBar = () => {
    if (isAdmin) return null;
    
    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.searchInput,
              isDarkMode ? styles.searchInputDark : styles.searchInputLight
            ]}
            placeholder="Buscar posts..."
            placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={searchPosts}
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={searchPosts}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    fetchPosts();
  };
  
  if (loading && !isSearching) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[
            styles.loadingText,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Carregando posts...
          </Text>
        </View>
      </View>
    );
  }
  
  if (error && !posts.length) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={48} 
            color={isDarkMode ? '#f44336' : '#d32f2f'} 
          />
          <Text style={[
            styles.errorText,
            isDarkMode ? styles.errorTextDark : styles.errorTextLight
          ]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchPosts}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {renderHeader()}
      {renderSearchBar()}
      
      {isSearching && !posts.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[
            styles.loadingText,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Buscando posts...
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostItem post={item} onPress={() => handlePostPress(item)} isDarkMode={isDarkMode} />
          )}
          contentContainerStyle={styles.postList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[
                styles.emptyText,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {searchTerm ? `Nenhum post encontrado para "${searchTerm}".` : 'Nenhum post disponível.'}
              </Text>
            </View>
          }
          refreshing={isSearching}
          onRefresh={fetchPosts}
        />
      )}
      
      <SideMenu
        visible={menuVisible}
        onClose={handleMenuPress}
        onLoginPress={() => handleMenuItemPress('login')}
        onOptionsPress={() => handleMenuItemPress('options')}
        onAboutPress={() => handleMenuItemPress('about')}
        isAuthenticated={isAuthenticated}
        isDarkMode={isDarkMode}
      />
      
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={handleClosePostDetail}
          canEdit={canEdit}
          canDelete={isAdmin}
          isDarkMode={isDarkMode}
        />
      )}
      
      {modalType === 'login' && (
        <LoginModal
          onClose={handleCloseModal}
          isDarkMode={isDarkMode}
        />
      )}
      
      {modalType === 'options' && (
        <OptionsModal
          onClose={handleCloseModal}
          isDarkMode={isDarkMode}
        />
      )}
      
      {modalType === 'about' && (
        <AboutModal
          onClose={handleCloseModal}
          isDarkMode={isDarkMode}
        />
      )}
      
      {modalType === 'admin' && (
        <AdminPanel
          onClose={handleCloseModal}
          isDarkMode={isDarkMode}
        />
      )}

      {canCreatePost && (
        <TouchableOpacity
          style={[
            styles.floatingButton,
            isDarkMode ? styles.floatingButtonDark : styles.floatingButtonLight
          ]}
          onPress={handleNewPostPress}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
      
      <PostNewItem
        visible={newPostModalVisible}
        onClose={handleCloseNewPostModal}
        onPostCreated={handlePostCreated}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.25,
  },
  headerCenter: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 0.25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  menuButton: {
    padding: 8,
  },
  adminButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  adminButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  newPostButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginRight: 5,
    fontSize: 14,
  },
  searchInputLight: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    color: '#333',
  },
  searchInputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#f5f5f5',
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginVertical: 10,
  },
  postList: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  errorTextLight: {
    color: '#d32f2f',
  },
  errorTextDark: {
    color: '#f44336',
  },
  retryButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
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
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 10,
  },
  floatingButtonLight: {
    backgroundColor: '#007aff',
  },
  floatingButtonDark: {
    backgroundColor: '#0a84ff',
  },
});