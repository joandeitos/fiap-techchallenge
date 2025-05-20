import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, AuthUser, AuthState, RegisterRequest, UpdateProfileRequest } from '@/types';


const TOKEN_STORAGE_KEY = '@BlogProfessores:token';


const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  clearError: () => {},
};


const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    token: null,
  });


  useEffect(() => {
    const loadSavedToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (savedToken) {
          // Se temos um token salvo, verificamos se ele ainda é válido
          setState(prev => ({ ...prev, loading: true }));
          await checkAuthWithToken(savedToken);
        }
      } catch (error) {
        console.error('Erro ao carregar token:', error);
      }
    };

    loadSavedToken();
  }, []);


  const checkAuthWithToken = async (token: string) => {
    try {
      console.log('Verificando autenticação com token...');
      
      const response = await fetch('http://localhost:4000/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Usuário autenticado com token:', userData);
        
        setState(prev => ({
          ...prev,
          user: userData,
          isAuthenticated: true,
          loading: false,
          error: null,
          token: token,
        }));
        
        return true;
      } else {

        console.log('Token inválido ou expirado');
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          token: null,
        }));
        
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        token: null,
      }));
      
      return false;
    }
  };


  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Enviando requisição de login para:', email);
      
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      console.log('Resposta do servidor (status):', response.status);
      console.log('Resposta do servidor (dados):', data);

      if (!response.ok) {
        console.error('Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        throw new Error(data.error || data.message || 'Falha ao fazer login');
      }


      const token = data.token;
      if (token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        console.warn('Login bem-sucedido, mas nenhum token foi recebido');
      }

      setState(prev => ({
        ...prev,
        user: data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
        token: token,
      }));
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido durante o login';
      
      console.error('Erro detalhado:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace disponível');
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      throw error;
    }
  };


  const register = async (userData: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Enviando requisição de registro:', userData);
      
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      console.log('Resposta do servidor (status):', response.status);
      console.log('Resposta do servidor (dados):', data);

      if (!response.ok) {
        console.error('Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        throw new Error(data.error || data.message || 'Falha ao registrar usuário');
      }


      const token = data.token;
      if (token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        console.warn('Registro bem-sucedido, mas nenhum token foi recebido');
      }

      setState(prev => ({
        ...prev,
        user: data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
        token: token,
      }));
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido durante o registro';
      
      console.error('Erro detalhado:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace disponível');
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      throw error;
    }
  };


  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    
    // Atualiza o estado
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      token: null,
    }));
  };

  const updateProfile = async (userData: UpdateProfileRequest) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!state.token) {
        throw new Error('Não autenticado. Faça login novamente.');
      }
      
      const response = await fetch('http://localhost:4000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao atualizar perfil');
      }

      setState(prev => ({
        ...prev,
        user: { ...prev.user, ...data.user } as AuthUser,
        loading: false,
        error: null,
      }));
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao atualizar perfil';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      throw error;
    }
  };


  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
export default useAuth;