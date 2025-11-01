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

const AwardsManagementScreen = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date: '',
    description: '',
  });

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const data = await apiClient.get(ENDPOINTS.AWARDS);
      setAwards(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.issuer) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(ENDPOINTS.AWARDS, formData);
      Alert.alert('Success', 'Award added');
      setFormData({ title: '', issuer: '', date: '', description: '' });
      setShowAddForm(false);
      fetchAwards();
    } catch (error) {
      Alert.alert('Error', 'Failed to add award');
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
            await apiClient.delete(`${ENDPOINTS.AWARDS}/${id}`);
            fetchAwards();
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
          title={showAddForm ? 'Cancel' : 'Add Award'}
          onPress={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'primary'}
        />
      </View>

      <ScrollView style={styles.content}>
        {showAddForm && (
          <Card>
            <Text style={styles.sectionTitle}>Add Award</Text>
            
            <Input
              label="Award Title *"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <Input
              label="Issuer/Organization *"
              value={formData.issuer}
              onChangeText={(text) => setFormData({ ...formData, issuer: text })}
            />

            <Input
              label="Date"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />

            <Input
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />

            <Button title="Add" onPress={handleCreate} loading={loading} />
          </Card>
        )}

        {awards.map((award) => (
          <Card key={award._id}>
            <Text style={styles.title}>🏆 {award.title}</Text>
            <Text style={styles.subtitle}>{award.issuer}</Text>
            {award.date && <Text style={styles.info}>📅 {award.date}</Text>}
            {award.description && <Text style={styles.desc}>{award.description}</Text>}
            
            <Button
              title="Delete"
              onPress={() => handleDelete(award._id)}
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
  desc: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.text,
    marginTop: spacing.sm,
  },
});

export default AwardsManagementScreen;
