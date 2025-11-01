import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { ThemeContext } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../utils/constants';

const ContactSection = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending contact form:', formData);
      const response = await apiClient.post(ENDPOINTS.CONTACT, formData);
      console.log('Contact response:', response);
      Alert.alert('Success', 'Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send message';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>Get In Touch</Text>
      <Card>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Feel free to reach out for collaborations or just a friendly hello 👋
        </Text>

        <Input
          label="Name *"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Your name"
        />

        <Input
          label="Email *"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Phone"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="+1 234 567 8900"
          keyboardType="phone-pad"
        />

        <Input
          label="Subject"
          value={formData.subject}
          onChangeText={(text) => setFormData({ ...formData, subject: text })}
          placeholder="What's this about?"
        />

        <Input
          label="Message *"
          value={formData.message}
          onChangeText={(text) => setFormData({ ...formData, message: text })}
          placeholder="Your message..."
          multiline
          numberOfLines={4}
        />

        <Button
          title="Send Message"
          onPress={handleSubmit}
          loading={loading}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heading: {
    ...fonts.bold,
    fontSize: fonts.sizes.xxl,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...fonts.regular,
    fontSize: fonts.sizes.md,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
});

export default ContactSection;
