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

const ArticlesManagementScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    tags: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const data = await apiClient.get(ENDPOINTS.ARTICLES);
      setArticles(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      setLoading(true);
      const articleData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()),
      };
      await apiClient.post(ENDPOINTS.ARTICLES, articleData);
      Alert.alert('Success', 'Article saved');
      setFormData({ title: '', content: '', summary: '', tags: '', status: 'draft' });
      setShowAddForm(false);
      fetchArticles();
    } catch (error) {
      Alert.alert('Error', 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await apiClient.patch(`${ENDPOINTS.ARTICLES}/${id}`, { status: newStatus });
      fetchArticles();
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
            await apiClient.delete(`${ENDPOINTS.ARTICLES}/${id}`);
            fetchArticles();
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
          title={showAddForm ? 'Cancel' : 'Write Article'}
          onPress={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'primary'}
        />
      </View>

      <ScrollView style={styles.content}>
        {showAddForm && (
          <Card>
            <Text style={styles.sectionTitle}>Write Article</Text>
            
            <Input
              label="Title *"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <Input
              label="Summary"
              value={formData.summary}
              onChangeText={(text) => setFormData({ ...formData, summary: text })}
              multiline
              numberOfLines={2}
            />

            <Input
              label="Content *"
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              multiline
              numberOfLines={8}
            />

            <Input
              label="Tags (comma separated)"
              value={formData.tags}
              onChangeText={(text) => setFormData({ ...formData, tags: text })}
            />

            <View style={styles.statusButtons}>
              <Button
                title="Save as Draft"
                onPress={() => {
                  setFormData({ ...formData, status: 'draft' });
                  handleCreate();
                }}
                variant="outline"
                style={{ flex: 1, marginRight: spacing.xs }}
              />
              <Button
                title="Publish"
                onPress={() => {
                  setFormData({ ...formData, status: 'published' });
                  handleCreate();
                }}
                style={{ flex: 1, marginLeft: spacing.xs }}
                loading={loading}
              />
            </View>
          </Card>
        )}

        {articles.map((article) => (
          <Card key={article._id}>
            <Text style={styles.title}>{article.title}</Text>
            {article.summary && <Text style={styles.summary}>{article.summary}</Text>}
            
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.statusBadge,
                  { backgroundColor: article.status === 'published' ? colors.success : colors.warning }
                ]}
                onPress={() => toggleStatus(article._id, article.status)}
              >
                <Text style={styles.statusText}>
                  {article.status === 'published' ? 'Published' : 'Draft'}
                </Text>
              </TouchableOpacity>
              
              <Button
                title="Delete"
                onPress={() => handleDelete(article._id)}
                variant="secondary"
                style={{ flex: 1, marginLeft: spacing.sm }}
              />
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
  title: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  summary: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statusBadge: {
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
});

export default ArticlesManagementScreen;
