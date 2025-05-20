import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeContextType, ColorSchemeType } from '@/types';


const THEME_STORAGE_KEY = '@BlogProfessores:theme';


const defaultColorSchemeContext: ColorSchemeContextType = {
  colorScheme: 'light',
  toggleColorScheme: () => {},
  setColorScheme: () => {},
};


const ColorSchemeContext = createContext<ColorSchemeContextType>(defaultColorSchemeContext);

interface ColorSchemeProviderProps {
  children: ReactNode;
}

export const ColorSchemeProvider = ({ children }: ColorSchemeProviderProps) => {
  const systemColorScheme = _useColorScheme() as ColorSchemeType || 'light';
  
  const [colorScheme, setColorScheme] = useState<ColorSchemeType>(systemColorScheme);

  useEffect(() => {
    loadColorScheme();
  }, []);

  const loadColorScheme = async () => {
    try {
      const savedScheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      
      if (savedScheme) {
        setColorScheme(savedScheme as ColorSchemeType);
      } else {
        setColorScheme(systemColorScheme);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      setColorScheme(systemColorScheme);
    }
  };

  const saveColorScheme = async (scheme: ColorSchemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
    saveColorScheme(newScheme);
  };

  const setScheme = (scheme: ColorSchemeType) => {
    setColorScheme(scheme);
    saveColorScheme(scheme);
  };

  return (
    <ColorSchemeContext.Provider
      value={{
        colorScheme,
        toggleColorScheme,
        setColorScheme: setScheme,
      }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = (): ColorSchemeContextType => useContext(ColorSchemeContext);

export default useColorScheme;