import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [defaultModel, setDefaultModel] = useState('gemini-1.5-flash');
  const [defaultMode, setDefaultMode] = useState('SolariLearn');
  const [timerPreset, setTimerPreset] = useState(25);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || '');
        setDefaultModel(data.default_model || 'gemini-1.5-flash');
        setDefaultMode(data.default_mode || 'SolariLearn');
        setTimerPreset(data.timer_preset || 25);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: displayName,
          default_model: defaultModel,
          default_mode: defaultMode,
          timer_preset: timerPreset,
        })
        .eq('id', session.user.id);

      if (error) throw error;
      Alert.alert('Success', 'Settings saved successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#185B37" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
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
          <TouchableOpacity style={styles.iconButton} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator size="small" color="#4B5563" /> : <Feather name="save" size={20} color="#4B5563" />}
          </TouchableOpacity>
          <View style={styles.profileAvatar}>
            <Feather name="user" size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subtitle}>Manage your profile, preferences, and account.</Text>
      </View>

      <Text style={styles.sectionTitle}>Profile Customization</Text>
      <View style={styles.sectionCard}>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="user" size={18} color="#4B5563" />
          </View>
          <TextInput 
            style={styles.settingInput}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Scholar Name"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>AI Configuration</Text>
      <View style={styles.sectionCard}>
        <TouchableOpacity 
          style={styles.settingRow} 
          activeOpacity={0.7}
          onPress={() => setDefaultModel(defaultModel === 'gemini-1.5-flash' ? 'gemini-1.5-pro' : 'gemini-1.5-flash')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="cpu" size={18} color="#4B5563" />
          </View>
          <Text style={styles.settingText}>Default Engine Model</Text>
          <Text style={styles.settingValue}>
            {defaultModel === 'gemini-1.5-flash' ? 'Flash (Fast)' : 'Pro (Advanced)'}
          </Text>
          <Feather name="refresh-cw" size={16} color="#D1D5DB" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingRow, { borderBottomWidth: 0 }]} 
          activeOpacity={0.7}
          onPress={() => setDefaultMode(defaultMode === 'SolariLearn' ? 'SolariSolve' : 'SolariLearn')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="book-open" size={18} color="#4B5563" />
          </View>
          <Text style={styles.settingText}>Preferred Study Mode</Text>
          <Text style={styles.settingValue}>{defaultMode}</Text>
          <Feather name="refresh-cw" size={16} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Study Timer Presets</Text>
      <View style={styles.sectionCard}>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="clock" size={18} color="#4B5563" />
          </View>
          <Text style={styles.settingText}>Default Focus Duration</Text>
        </View>
        <View style={styles.timerChipContainer}>
          {[15, 25, 45, 60].map(mins => (
            <TouchableOpacity 
              key={mins} 
              style={[styles.timerChip, timerPreset === mins && styles.timerChipActive]}
              onPress={() => setTimerPreset(mins)}
            >
              <Text style={[styles.timerChipText, timerPreset === mins && styles.timerChipTextActive]}>
                {mins} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Data & Privacy</Text>
      <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="download" size={18} color="#4B5563" />
          </View>
          <Text style={styles.settingText}>Export Workspace Data</Text>
          <Feather name="chevron-right" size={20} color="#D1D5DB" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
            <Feather name="trash-2" size={18} color="#EF4444" />
          </View>
          <Text style={[styles.settingText, { color: '#EF4444' }]}>Delete Account</Text>
          <Feather name="chevron-right" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleSignOut}>
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
    backgroundColor: '#185B37',
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
  settingInput: {
    flex: 1,
    fontFamily: 'Bricolage_500',
    fontSize: 16,
    color: '#111827',
    outlineStyle: 'none' as any,
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
    marginRight: 8 
  },
  timerChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  timerChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timerChipActive: {
    backgroundColor: '#E6F0EB',
    borderColor: '#185B37',
  },
  timerChipText: {
    fontFamily: 'Bricolage_500',
    fontSize: 14,
    color: '#4B5563',
  },
  timerChipTextActive: {
    color: '#185B37',
    fontFamily: 'Bricolage_600',
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