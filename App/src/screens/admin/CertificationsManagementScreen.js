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

const CertificationsManagementScreen = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialId: '',
    url: '',
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const data = await apiClient.get(ENDPOINTS.CERTIFICATIONS);
      setCertifications(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.issuer) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(ENDPOINTS.CERTIFICATIONS, formData);
      Alert.alert('Success', 'Certification added');
      setFormData({ name: '', issuer: '', date: '', credentialId: '', url: '' });
      setShowAddForm(false);
      fetchCertifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to add certification');
    } finally {
      setLoading(false);
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
            await apiClient.delete(`${ENDPOINTS.CERTIFICATIONS}/${id}`);
            fetchCertifications();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title={showAddForm ? 'Cancel' : 'Add Certification'}
          onPress={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'primary'}
        />
      </View>

      <ScrollView style={styles.content}>
        {showAddForm && (
          <Card>
            <Text style={styles.sectionTitle}>Add Certification</Text>
            
            <Input
              label="Certification Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Input
              label="Issuing Organization *"
              value={formData.issuer}
              onChangeText={(text) => setFormData({ ...formData, issuer: text })}
            />

            <Input
              label="Issue Date"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              placeholder="e.g., January 2023"
            />

            <Input
              label="Credential ID"
              value={formData.credentialId}
              onChangeText={(text) => setFormData({ ...formData, credentialId: text })}
            />

            <Input
              label="Credential URL"
              value={formData.url}
              onChangeText={(text) => setFormData({ ...formData, url: text })}
            />

            <Button title="Add" onPress={handleCreate} loading={loading} />
          </Card>
        )}

        {certifications.map((cert) => (
          <Card key={cert._id}>
            <Text style={styles.title}>{cert.name}</Text>
            <Text style={styles.subtitle}>{cert.issuer}</Text>
            {cert.date && <Text style={styles.info}>📅 {cert.date}</Text>}
            {cert.credentialId && <Text style={styles.info}>ID: {cert.credentialId}</Text>}
            
            <Button
              title="Delete"
              onPress={() => handleDelete(cert._id)}
              variant="secondary"
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ))}
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
    padding: spacing.md,
    backgroundColor: colors.surface,
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
  title: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  subtitle: {
    ...fonts.medium,
    fontSize: fonts.sizes.md,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  info: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default CertificationsManagementScreen;
