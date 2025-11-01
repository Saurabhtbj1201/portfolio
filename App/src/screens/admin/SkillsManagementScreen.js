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
import { skillsApi } from '../../api/skills';

const SkillsManagementScreen = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    level: '',
    image: null,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await skillsApi.getAll();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleCreate = async () => {
    if (!formData.category || !formData.name) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // If there's an image, upload it first
      let imageUrl = null;
      if (formData.image) {
        const formDataImage = new FormData();
        formDataImage.append('image', {
          uri: formData.image,
          type: 'image/jpeg',
          name: 'skill.jpg',
        });
        // Assuming you have an upload endpoint
        const uploadResponse = await apiClient.post('/skills/upload', formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadResponse.imageUrl;
      }

      const skillData = {
        category: formData.category,
        name: formData.name,
        level: formData.level,
        image: imageUrl,
      };

      await skillsApi.create(skillData);
      Alert.alert('Success', 'Skill added successfully');
      setFormData({ category: '', name: '', level: '', image: null });
      setShowAddForm(false);
      fetchSkills();
    } catch (error) {
      Alert.alert('Error', 'Failed to add skill');
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
            await skillsApi.delete(id);
            Alert.alert('Success', 'Skill deleted');
            fetchSkills();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete skill');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title={showAddForm ? 'Cancel' : 'Add Skill'}
          onPress={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'primary'}
        />
      </View>

      <ScrollView style={styles.content}>
        {showAddForm && (
          <Card>
            <Text style={styles.sectionTitle}>Add New Skill</Text>
            
            <Input
              label="Category"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder="e.g., Frontend, Backend"
            />

            <Input
              label="Skill Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., React, Node.js"
            />

            <Input
              label="Level (Optional)"
              value={formData.level}
              onChangeText={(text) => setFormData({ ...formData, level: text })}
              placeholder="e.g., Expert, Intermediate"
            />

            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Skill Icon (Optional)</Text>
              {formData.image && (
                <Image source={{ uri: formData.image }} style={styles.skillIconPreview} />
              )}
              <Button
                title={formData.image ? "Change Icon" : "Upload Icon"}
                onPress={pickImage}
                variant="outline"
              />
            </View>

            <Button
              title="Add Skill"
              onPress={handleCreate}
              loading={loading}
            />
          </Card>
        )}

        {skills.map((category, index) => (
          <Card key={index}>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            {category.skills?.map((skill, idx) => (
              <View key={idx} style={styles.skillItem}>
                <View style={styles.skillInfo}>
                  {skill.image && (
                    <Image source={{ uri: skill.image }} style={styles.skillIcon} />
                  )}
                  <Text style={styles.skillName}>{skill.name}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(skill._id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
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
  categoryTitle: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  skillName: {
    ...fonts.regular,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  deleteText: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: colors.error,
  },
  imageSection: {
    marginBottom: spacing.md,
  },
  imageLabel: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  skillIconPreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: spacing.sm,
    alignSelf: 'center',
  },
  skillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skillIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: spacing.md,
  },
});

export default SkillsManagementScreen;
