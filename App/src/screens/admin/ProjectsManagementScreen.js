import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { projectsApi } from '../../api/projects';

const ProjectsManagementScreen = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    link: '',
    github: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const projectData = {
        ...formData,
        technologies: formData.technologies.split(',').map(t => t.trim()),
      };
      await projectsApi.create(projectData);
      Alert.alert('Success', 'Project added successfully');
      setFormData({ title: '', description: '', technologies: '', link: '', github: '' });
      setShowAddForm(false);
      fetchProjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to add project');
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
            await projectsApi.delete(id);
            Alert.alert('Success', 'Project deleted');
            fetchProjects();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete project');
          }
        },
      },
    ]);
  };

  const toggleVisibility = async (id) => {
    try {
      await projectsApi.toggleVisibility(id);
      fetchProjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle visibility');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title={showAddForm ? 'Cancel' : 'Add Project'}
          onPress={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'primary'}
        />
      </View>

      <ScrollView style={styles.content}>
        {showAddForm && (
          <Card>
            <Text style={styles.sectionTitle}>Add New Project</Text>
            
            <Input
              label="Title *"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Project name"
            />

            <Input
              label="Description *"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Project description"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Technologies (comma separated)"
              value={formData.technologies}
              onChangeText={(text) => setFormData({ ...formData, technologies: text })}
              placeholder="React, Node.js, MongoDB"
            />

            <Input
              label="Live Link"
              value={formData.link}
              onChangeText={(text) => setFormData({ ...formData, link: text })}
              placeholder="https://project.com"
            />

            <Input
              label="GitHub Link"
              value={formData.github}
              onChangeText={(text) => setFormData({ ...formData, github: text })}
              placeholder="https://github.com/..."
            />

            <Button
              title="Add Project"
              onPress={handleCreate}
              loading={loading}
            />
          </Card>
        )}

        {projects.map((project) => (
          <Card key={project._id}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.projectDesc}>{project.description}</Text>
            
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: project.visible ? colors.success : colors.warning }]}
                onPress={() => toggleVisibility(project._id)}
              >
                <Text style={styles.actionText}>
                  {project.visible ? 'Visible' : 'Hidden'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => handleDelete(project._id)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
  projectTitle: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  projectDesc: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  actionText: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: colors.white,
  },
});

export default ProjectsManagementScreen;
