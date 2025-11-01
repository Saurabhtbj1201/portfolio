import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  try {
    return (
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    );
  } catch (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    padding: 20,
  },
});
