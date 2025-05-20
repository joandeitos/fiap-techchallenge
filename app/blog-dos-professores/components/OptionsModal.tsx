import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OptionsModalProps } from '@/types';
import { useColorScheme } from '@/hooks/useColorScheme';

const OptionsModal: React.FC<OptionsModalProps> = ({ onClose, isDarkMode }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  
  // Função para alternar o tema
  const handleThemeChange = (theme: 'light' | 'dark') => {
    setColorScheme(theme);
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
            Opções
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <Text style={[
            styles.sectionTitle,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Tema do Aplicativo
          </Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                colorScheme === 'light' && styles.optionButtonActive,
                isDarkMode ? styles.optionButtonDark : styles.optionButtonLight,
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Ionicons name="sunny-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
              <Text style={[
                styles.optionText,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Claro
              </Text>
              {colorScheme === 'light' && (
                <Ionicons name="checkmark" size={20} color="#2196f3" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                colorScheme === 'dark' && styles.optionButtonActive,
                isDarkMode ? styles.optionButtonDark : styles.optionButtonLight,
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Ionicons name="moon-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
              <Text style={[
                styles.optionText,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Escuro
              </Text>
              {colorScheme === 'dark' && (
                <Ionicons name="checkmark" size={20} color="#2196f3" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={[
            styles.helpText,
            isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
          ]}>
            Selecione o tema de sua preferência para o aplicativo.
          </Text>
        </View>
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
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  optionButtonLight: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  optionButtonDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  optionButtonActive: {
    borderColor: '#2196f3',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  helpText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default OptionsModal;