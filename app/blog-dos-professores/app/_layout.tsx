import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/hooks/useAuth';
import { ColorSchemeProvider, useColorScheme } from '@/hooks/useColorScheme';


export default function RootLayout() {
  return (
    <ColorSchemeProvider>
      <AuthProvider>
        <RootLayoutNavigation />
      </AuthProvider>
    </ColorSchemeProvider>
  );
}


function RootLayoutNavigation() {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDarkMode ? '#121212' : '#ffffff',
          },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaProvider>
  );
}