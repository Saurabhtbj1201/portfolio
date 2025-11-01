import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { profileApi } from '../../api/profile';

const ProfileManagementScreen = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    title: '',
    tags: '',
    description: '',
    email: '',
    place: '',
  });
  const [images, setImages] = useState({
    profileImage: null,
    aboutImage: null,
    logo: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileApi.get();
      setProfile({
        title: data.title || '',
        tags: data.tags?.join(', ') || '',
        description: data.description || '',
        email: data.email || '',
        place: data.place || '',
      });
      setImages({
        profileImage: data.profileImage,
        aboutImage: data.aboutImage,
        logo: data.logo,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0].uri, type);
    }
  };

  const uploadImage = async (uri, type) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: `${type}.jpg`,
      });

      await profileApi.uploadImage(formData, type);
      setImages({ ...images, [type]: uri });
      Alert.alert('Success', 'Image uploaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (type) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await profileApi.deleteImage(type);
            setImages({ ...images, [type]: null });
            Alert.alert('Success', 'Image deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete image');
          }
        },
      },
    ]);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.type === 'success') {
        const formData = new FormData();
        formData.append('resume', {
          uri: result.uri,
          type: 'application/pdf',
          name: result.name,
        });
        await profileApi.uploadImage(formData, 'resume');
        Alert.alert('Success', 'Resume uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload resume');
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const updateData = {
        ...profile,
        tags: profile.tags.split(',').map(tag => tag.trim()),
      };
      await profileApi.update(updateData);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <Input
          label="Title"
          value={profile.title}
          onChangeText={(text) => setProfile({ ...profile, title: text })}
          placeholder="e.g., Full Stack Developer"
        />

        <Input
          label="Tags (comma separated)"
          value={profile.tags}
          onChangeText={(text) => setProfile({ ...profile, tags: text })}
          placeholder="e.g., React, Node.js, MongoDB"
        />

        <Input
          label="Description"
          value={profile.description}
          onChangeText={(text) => setProfile({ ...profile, description: text })}
          placeholder="About yourself"
          multiline
          numberOfLines={4}
        />

        <Input
          label="Email"
          value={profile.email}
          onChangeText={(text) => setProfile({ ...profile, email: text })}
          placeholder="your@email.com"
          keyboardType="email-address"
        />

        <Input
          label="Location"
          value={profile.place}
          onChangeText={(text) => setProfile({ ...profile, place: text })}
          placeholder="e.g., New York, USA"
        />

        <Button
          title="Update Profile"
          onPress={handleUpdate}
          loading={loading}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Images</Text>

        {/* Profile and About Images in One Row */}
        <View style={styles.imagesRow}>
          <View style={styles.imageColumn}>
            <Text style={styles.imageLabel}>Profile Image</Text>
            {images.profileImage && (
              <Image source={{ uri: images.profileImage }} style={styles.imageHalf} />
            )}
            <View style={styles.buttonColumn}>
              <Button
                title="Upload"
                onPress={() => pickImage('profileImage')}
                style={styles.smallButton}
              />
              {images.profileImage && (
                <Button
                  title="Delete"
                  onPress={() => deleteImage('profileImage')}
                  variant="secondary"
                  style={styles.smallButton}
                />
              )}
            </View>
          </View>

          <View style={styles.imageColumn}>
            <Text style={styles.imageLabel}>About Image</Text>
            {images.aboutImage && (
              <Image source={{ uri: images.aboutImage }} style={styles.imageHalf} />
            )}
            <View style={styles.buttonColumn}>
              <Button
                title="Upload"
                onPress={() => pickImage('aboutImage')}
                style={styles.smallButton}
              />
              {images.aboutImage && (
                <Button
                  title="Delete"
                  onPress={() => deleteImage('aboutImage')}
                  variant="secondary"
                  style={styles.smallButton}
                />
              )}
            </View>
          </View>
        </View>

        {/* Logo Section */}
        <View style={styles.imageSection}>
          <Text style={styles.imageLabel}>Logo</Text>
          {images.logo && (
            <Image source={{ uri: images.logo }} style={styles.image} />
          )}
          <View style={styles.buttonRow}>
            <Button
              title="Upload"
              onPress={() => pickImage('logo')}
              style={styles.imageButton}
            />
            {images.logo && (
              <Button
                title="Delete"
                onPress={() => deleteImage('logo')}
                variant="secondary"
                style={styles.imageButton}
              />
            )}
          </View>
        </View>

        <Button
          title="Upload Resume (PDF)"
          onPress={pickDocument}
          variant="outline"
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  sectionTitle: {
    ...fonts.bold,
    fontSize: fonts.sizes.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  imageSection: {
    marginBottom: spacing.lg,
  },
  imageLabel: {
    ...fonts.medium,
    fontSize: fonts.sizes.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  imagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  imageColumn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  imageHalf: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  buttonColumn: {
    gap: spacing.xs,
  },
  smallButton: {
    marginBottom: spacing.xs,
  },
});

export default ProfileManagementScreen;
