import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {}
      <View style={styles.topNav}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Feather name="menu" size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search settings..."
            placeholderTextColor="#9CA3AF"
          />
          <View style={styles.shortcutBadge}>
            <Text style={styles.shortcutText}>⌘F</Text>
          </View>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={20} color="#4B5563" />
          </TouchableOpacity>
          <View style={styles.profileAvatar}>
            <Feather name="user" size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences.</Text>
      </View>

      {}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="user" size={18} color="#4B5563" />
          </View>
          <Text style={styles.settingText}>Profile Information</Text>
          <Feather name="chevron-right" size={20} color="#D1D5DB" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="bell" size={18} color="#4B5563" />
          </View>
          <Text style={styles.settingText}>Notifications</Text>
          <Feather name="chevron-right" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="moon" size={18} color="#4B5563" />
          </View>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Text style={styles.settingValue}>Off</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="globe" size={18} color="#4B5563" />
          </View>
          <Text style={styles.settingText}>Language</Text>
          <Text style={styles.settingValue}>English</Text>
        </TouchableOpacity>
      </View>

      {}
      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
        <Feather name="log-out" size={18} color="#EF4444" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
    maxWidth: 800, 
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 64,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 16,
  },
  menuButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxWidth: 500,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Bricolage_400',
    fontSize: 15,
    color: '#111827',
    outlineStyle: 'solid',
    outlineColor: 'transparent',
  },
  shortcutBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shortcutText: {
    fontFamily: 'Bricolage_500',
    fontSize: 12,
    color: '#6B7280',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: { 
    marginBottom: 32 
  },
  header: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 32, 
    color: '#111827', 
    letterSpacing: -0.5, 
    marginBottom: 8 
  },
  subtitle: { 
    fontFamily: 'Bricolage_400', 
    fontSize: 16, 
    color: '#6B7280', 
  },
  sectionTitle: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 14, 
    color: '#9CA3AF', 
    letterSpacing: 0.5, 
    textTransform: 'uppercase', 
    marginBottom: 12, 
    marginTop: 32 
  },
  sectionCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    overflow: 'hidden' 
  },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 20,
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  iconBox: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  settingText: { 
    flex: 1, 
    fontFamily: 'Bricolage_500', 
    fontSize: 16, 
    color: '#111827', 
  },
  settingValue: { 
    fontFamily: 'Bricolage_500', 
    fontSize: 15, 
    color: '#6B7280', 
    marginRight: 4 
  },
  logoutButton: { 
    flexDirection: 'row',
    marginTop: 48, 
    padding: 16, 
    borderRadius: 16, 
    backgroundColor: '#FEF2F2', 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 16, 
    color: '#EF4444', 
  }
});