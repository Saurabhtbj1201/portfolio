import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import HomeScreen from '../screens/HomeScreen';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  console.log('AppNavigator - Loading:', loading, 'User:', user ? 'logged in' : 'guest');

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      {user ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.text,
    marginTop: 10,
  },
});

export default AppNavigator;
