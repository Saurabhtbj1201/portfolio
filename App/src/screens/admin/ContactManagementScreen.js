import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../utils/constants';

const ContactManagementScreen = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await apiClient.get(ENDPOINTS.CONTACT);
      setContacts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      await apiClient.patch(`${ENDPOINTS.CONTACT}/${id}`, {
        approved: !currentStatus,
      });
      fetchContacts();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`${ENDPOINTS.CONTACT}/${id}`);
            fetchContacts();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Contact Submissions</Text>
      
      {contacts.map((contact) => (
        <Card key={contact._id}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.email}>📧 {contact.email}</Text>
          {contact.phone && <Text style={styles.info}>📱 {contact.phone}</Text>}
          {contact.subject && <Text style={styles.subject}>Subject: {contact.subject}</Text>}
          <Text style={styles.message}>{contact.message}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                { backgroundColor: contact.approved ? colors.success : colors.warning }
              ]}
              onPress={() => toggleApproval(contact._id, contact.approved)}
            >
              <Text style={styles.statusText}>
                {contact.approved ? 'Approved' : 'Pending'}
              </Text>
            </TouchableOpacity>
            
            <Button
              title="Delete"
              onPress={() => handleDelete(contact._id)}
              variant="secondary"
              style={{ flex: 1, marginLeft: spacing.sm }}
            />
          </View>
          
          <Text style={styles.date}>
            {new Date(contact.createdAt).toLocaleDateString()}
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    ...fonts.bold,
    fontSize: fonts.sizes.xl,
    color: colors.text,
    marginBottom: spacing.md,
  },
  name: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  email: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  info: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  subject: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: colors.text,
    marginTop: spacing.sm,
  },
  message: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  statusText: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: colors.white,
  },
  date: {
    ...fonts.regular,
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default ContactManagementScreen;
