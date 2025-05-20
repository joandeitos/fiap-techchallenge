import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AboutModalProps } from '@/types';

const AboutModal: React.FC<AboutModalProps> = ({ onClose, isDarkMode }) => {

  const openGitHubLink = () => {
    Linking.openURL('https://github.com/joandeitos/techchallenge');
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
          <Text style={[
            styles.headerTitle,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Sobre
          </Text>
        </View>
        
        <ScrollView style={styles.content}>
          <Text style={[
            styles.title,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Tech Challenge 02
          </Text>
          
          <Text 
            style={[
              styles.githubLink,
              isDarkMode ? styles.linkTextDark : styles.linkTextLight
            ]}
            onPress={openGitHubLink}
          >
            https://github.com/joandeitos/techchallenge
          </Text>
          
          <Text style={[
            styles.sectionTitle,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            Integrantes do Grupo 20:
          </Text>
          
          <View style={styles.teamList}>
            <View style={styles.teamItem}>
              <Ionicons name="person" size={18} color={isDarkMode ? '#aaa' : '#666'} />
              <Text style={[
                styles.teamMember,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Antonio Augusto Gotz Carneiro
              </Text>
            </View>
            
            <View style={styles.teamItem}>
              <Ionicons name="person" size={18} color={isDarkMode ? '#aaa' : '#666'} />
              <Text style={[
                styles.teamMember,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Thiago Augusto Rodrigues
              </Text>
            </View>
            
            <View style={styles.teamItem}>
              <Ionicons name="person" size={18} color={isDarkMode ? '#aaa' : '#666'} />
              <Text style={[
                styles.teamMember,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Joan Emilio Deitos
              </Text>
            </View>
            
            <View style={styles.teamItem}>
              <Ionicons name="person" size={18} color={isDarkMode ? '#aaa' : '#666'} />
              <Text style={[
                styles.teamMember,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Silton Heleno Maciel Júnior
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={[
            styles.appDescription,
            isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
          ]}>
            Este aplicativo foi desenvolvido como parte do Tech Challenge 02 da FIAP. 
            O Blog dos Professores é uma plataforma onde professores podem compartilhar 
            conteúdo e alunos podem acessar informações relevantes.
          </Text>
          
          <View style={styles.versionInfo}>
            <Text style={[
              styles.versionText,
              isDarkMode ? styles.mutedTextDark : styles.mutedTextLight
            ]}>
              Versão 1.0.0
            </Text>
          </View>
        </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
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
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  githubLink: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  linkTextLight: {
    color: '#2196f3',
  },
  linkTextDark: {
    color: '#64b5f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  teamList: {
    marginBottom: 24,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  teamMember: {
    fontSize: 16,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  appDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'justify',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  versionText: {
    fontSize: 14,
  },
});

export default AboutModal;