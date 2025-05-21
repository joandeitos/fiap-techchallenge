import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SideMenuProps } from '@/types';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.5;

const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  onLoginPress,
  onOptionsPress,
  onAboutPress,
  isAuthenticated,
  isDarkMode
}) => {
  // Animation value for menu slide
  const [animation] = React.useState(new Animated.Value(MENU_WIDTH));

  React.useEffect(() => {
    if (visible) {
      // Animate menu in
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate menu out
      Animated.timing(animation, {
        toValue: MENU_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animation]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.menuContainer,
            isDarkMode ? styles.menuContainerDark : styles.menuContainerLight,
            { transform: [{ translateX: animation }] },
          ]}
        >
          <View style={styles.menuHeader}>
            <Text style={[
              styles.menuTitle,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              Menu
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.menuItems}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={onLoginPress}
            >
              <Ionicons
                name={isAuthenticated ? 'person' : 'log-in'}
                size={20}
                color={isDarkMode ? '#fff' : '#000'}
                style={styles.menuItemIcon}
              />
              <Text style={[
                styles.menuItemText,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {isAuthenticated ? 'Perfil' : 'Login'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={onOptionsPress}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={isDarkMode ? '#fff' : '#000'}
                style={styles.menuItemIcon}
              />
              <Text style={[
                styles.menuItemText,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Opções
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={onAboutPress}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={isDarkMode ? '#fff' : '#000'}
                style={styles.menuItemIcon}
              />
              <Text style={[
                styles.menuItemText,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                Sobre
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  overlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    width: MENU_WIDTH,
    height: '100%',
    position: 'absolute',
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  menuContainerLight: {
    backgroundColor: '#fff',
  },
  menuContainerDark: {
    backgroundColor: '#2a2a2a',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
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
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
});

export default SideMenu;