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

const EducationManagementScreen = () => {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    duration: '',
    grade: '',
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const data = await apiClient.get(ENDPOINTS.EDUCATION);
      setEducation(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.institution || !formData.degree) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(ENDPOINTS.EDUCATION, formData);
      Alert.alert('Success', 'Education added');
      setFormData({ institution: '', degree: '', field: '', duration: '', grade: '' });
      setShowAddForm(false);
      fetchEducation();
    } catch (error) {
      Alert.alert('Error', 'Failed to add education');
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
            await apiClient.delete(`${ENDPOINTS.EDUCATION}/${id}`);
            fetchEducation();
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
          title={showAddForm ? 'Cancel' : 'Add Education'}
          onPress={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'primary'}
        />
      </View>

      <ScrollView style={styles.content}>
        {showAddForm && (
          <Card>
            <Text style={styles.sectionTitle}>Add Education</Text>
            
            <Input
              label="Institution *"
              value={formData.institution}
              onChangeText={(text) => setFormData({ ...formData, institution: text })}
            />

            <Input
              label="Degree *"
              value={formData.degree}
              onChangeText={(text) => setFormData({ ...formData, degree: text })}
            />

            <Input
              label="Field of Study"
              value={formData.field}
              onChangeText={(text) => setFormData({ ...formData, field: text })}
            />

            <Input
              label="Duration"
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
            />

            <Input
              label="Grade/GPA"
              value={formData.grade}
              onChangeText={(text) => setFormData({ ...formData, grade: text })}
            />

            <Button title="Add" onPress={handleCreate} loading={loading} />
          </Card>
        )}

        {education.map((edu) => (
          <Card key={edu._id}>
            <Text style={styles.title}>{edu.degree}</Text>
            <Text style={styles.subtitle}>{edu.institution}</Text>
            {edu.field && <Text style={styles.info}>{edu.field}</Text>}
            {edu.duration && <Text style={styles.info}>{edu.duration}</Text>}
            {edu.grade && <Text style={styles.info}>Grade: {edu.grade}</Text>}
            
            <Button
              title="Delete"
              onPress={() => handleDelete(edu._id)}
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

export default EducationManagementScreen;
