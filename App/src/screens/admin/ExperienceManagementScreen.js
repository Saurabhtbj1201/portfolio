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
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../utils/constants';

const ExperienceManagementScreen = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    duration: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const data = await apiClient.get(ENDPOINTS.EXPERIENCE);
      setExperiences(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      if (error.response?.status === 404) {
        // Endpoint doesn't exist, set empty array
        setExperiences([]);
      }
    }
  };

  const handleCreate = async () => {
    if (!formData.company || !formData.position) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post(ENDPOINTS.EXPERIENCE, formData);
      console.log('Experience created:', response);
      Alert.alert('Success', 'Experience added');
      setFormData({ company: '', position: '', duration: '', description: '', location: '' });
      setShowAddForm(false);
      fetchExperiences();
    } catch (error) {
      console.error('Create error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add experience');
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
            await apiClient.delete(`${ENDPOINTS.EXPERIENCE}/${id}`);
            Alert.alert('Success', 'Deleted');
            fetchExperiences();
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
          title={showAddForm ? 'Cancel' : 'Add Experience'}
          onPress={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'primary'}
        />
      </View>

      <ScrollView style={styles.content}>
        {showAddForm && (
          <Card>
            <Text style={styles.sectionTitle}>Add Experience</Text>
            
            <Input
              label="Company *"
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              placeholder="Company name"
            />

            <Input
              label="Position *"
              value={formData.position}
              onChangeText={(text) => setFormData({ ...formData, position: text })}
              placeholder="Job title"
            />

            <Input
              label="Duration"
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
              placeholder="e.g., Jan 2020 - Present"
            />

            <Input
              label="Location"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="City, Country"
            />

            <Input
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              placeholder="Describe your responsibilities..."
            />

            <Button title="Add" onPress={handleCreate} loading={loading} />
          </Card>
        )}

        {experiences.length === 0 && !showAddForm && (
          <Card>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No experiences added yet. Click "Add Experience" to get started.
            </Text>
          </Card>
        )}

        {experiences.map((exp) => (
          <Card key={exp._id}>
            <Text style={styles.title}>{exp.position}</Text>
            <Text style={styles.subtitle}>{exp.company}</Text>
            {exp.duration && <Text style={styles.info}>📅 {exp.duration}</Text>}
            {exp.location && <Text style={styles.info}>📍 {exp.location}</Text>}
            {exp.description && <Text style={styles.desc}>{exp.description}</Text>}
            
            <Button
              title="Delete"
              onPress={() => handleDelete(exp._id)}
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
  emptyText: {
    ...fonts.regular,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
    padding: spacing.lg,
  },
});

export default ExperienceManagementScreen;
