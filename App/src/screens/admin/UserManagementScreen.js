import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../utils/constants';
import { authApi } from '../../api/auth';

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get(ENDPOINTS.USERS);
      console.log('Fetched users:', data);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 404) {
        setUsers([]);
      }
    }
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await authApi.register(formData);
      Alert.alert('Success', 'User added');
      setFormData({ name: '', email: '', password: '' });
      setShowAddForm(false);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      Alert.alert('Success', 'Password changed');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`${ENDPOINTS.USERS}/${id}`);
            fetchUsers();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete user');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Change Password"
          onPress={() => setShowPasswordForm(!showPasswordForm)}
          variant={showPasswordForm ? 'secondary' : 'outline'}
          style={styles.headerButton}
        />
        <Button
          title={showAddForm ? 'Cancel' : 'Add User'}
          onPress={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'primary'}
          style={styles.headerButton}
        />
      </View>

      <ScrollView style={styles.content}>
        {showPasswordForm && (
          <Card>
            <Text style={styles.sectionTitle}>Change Your Password</Text>
            
            <Input
              label="Current Password *"
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
              secureTextEntry
              placeholder="Enter current password"
            />

            <Input
              label="New Password *"
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
              secureTextEntry
              placeholder="Enter new password"
            />

            <Input
              label="Confirm New Password *"
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
              secureTextEntry
              placeholder="Confirm new password"
            />

            <Button
              title="Change Password"
              onPress={handleChangePassword}
              loading={loading}
            />
          </Card>
        )}

        {showAddForm && (
          <Card>
            <Text style={styles.sectionTitle}>Add New Admin User</Text>
            
            <Input
              label="Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter name"
            />

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email"
            />

            <Input
              label="Password *"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              placeholder="Enter password"
            />

            <Button
              title="Add User"
              onPress={handleCreateUser}
              loading={loading}
            />
          </Card>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Admin Users</Text>
          <Text style={styles.userCount}>
            {users.length} {users.length === 1 ? 'User' : 'Users'}
          </Text>
        </View>

        {users.length === 0 ? (
          <Card>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No admin users found. Add a user to get started.
            </Text>
          </Card>
        ) : (
          users.map((user, index) => (
            <Card key={user._id || index}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userBadge}>
                    <Text style={styles.userInitial}>
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name || 'Unnamed User'}</Text>
                    <Text style={styles.userEmail}>{user.email || 'No email'}</Text>
                    {user.role && (
                      <Text style={styles.userRole}>
                        Role: {user.role}
                      </Text>
                    )}
                    {user.createdAt && (
                      <Text style={styles.userDate}>
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
                
                <Button
                  title="Delete"
                  onPress={() => handleDeleteUser(user._id)}
                  variant="secondary"
                  style={styles.deleteButton}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
  },
  headerButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    ...fonts.bold,
    fontSize: fonts.sizes.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  userEmail: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  userRole: {
    ...fonts.regular,
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  userCount: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: colors.primary,
  },
  userBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userInitial: {
    ...fonts.bold,
    fontSize: fonts.sizes.xl,
    color: colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userDate: {
    ...fonts.regular,
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyText: {
    ...fonts.regular,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
    padding: spacing.lg,
  },
});

export default UserManagementScreen;
