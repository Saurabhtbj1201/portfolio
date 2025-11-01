import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);

    if (result.success) {
      // Navigate to Home first, then the navigation will automatically show Admin drawer
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>Sign in to manage your portfolio</Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter your email"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
        />

        <Button
          title="Login"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="Back to Home"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...fonts.bold,
    fontSize: fonts.sizes.xxxl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...fonts.regular,
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
});

export default LoginScreen;
