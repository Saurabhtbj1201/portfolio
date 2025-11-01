import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ProfileManagementScreen from '../screens/admin/ProfileManagementScreen';
import SkillsManagementScreen from '../screens/admin/SkillsManagementScreen';
import ProjectsManagementScreen from '../screens/admin/ProjectsManagementScreen';
import ExperienceManagementScreen from '../screens/admin/ExperienceManagementScreen';
import EducationManagementScreen from '../screens/admin/EducationManagementScreen';
import CertificationsManagementScreen from '../screens/admin/CertificationsManagementScreen';
import ArticlesManagementScreen from '../screens/admin/ArticlesManagementScreen';
import AwardsManagementScreen from '../screens/admin/AwardsManagementScreen';
import ContactManagementScreen from '../screens/admin/ContactManagementScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

const AdminNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.surface,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Profile" component={ProfileManagementScreen} />
      <Drawer.Screen name="Skills" component={SkillsManagementScreen} />
      <Drawer.Screen name="Projects" component={ProjectsManagementScreen} />
      <Drawer.Screen name="Experience" component={ExperienceManagementScreen} />
      <Drawer.Screen name="Education" component={EducationManagementScreen} />
      <Drawer.Screen name="Certifications" component={CertificationsManagementScreen} />
      <Drawer.Screen name="Articles" component={ArticlesManagementScreen} />
      <Drawer.Screen name="Awards" component={AwardsManagementScreen} />
      <Drawer.Screen name="Contact" component={ContactManagementScreen} />
      <Drawer.Screen name="Users" component={UserManagementScreen} />
    </Drawer.Navigator>
  );
};

export default AdminNavigator;
