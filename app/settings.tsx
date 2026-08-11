import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences.</Text>
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.sectionGroup}>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <Feather name="user" size={20} color="#222222" style={styles.settingIcon} />
          <Text style={styles.settingText}>Profile Information</Text>
          <Feather name="chevron-right" size={20} color="#CCCCCC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <Feather name="bell" size={20} color="#222222" style={styles.settingIcon} />
          <Text style={styles.settingText}>Notifications</Text>
          <Feather name="chevron-right" size={20} color="#CCCCCC" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.sectionGroup}>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <Feather name="moon" size={20} color="#222222" style={styles.settingIcon} />
          <Text style={styles.settingText}>Dark Mode</Text>
          <Text style={styles.settingValue}>Off</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <Feather name="globe" size={20} color="#222222" style={styles.settingIcon} />
          <Text style={styles.settingText}>Language</Text>
          <Text style={styles.settingValue}>English</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  headerContainer: { marginBottom: 32, marginTop: 10 },
  header: { fontFamily: 'Bricolage_600', fontSize: 32, color: '#222222', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontFamily: 'Bricolage_400', fontSize: 16, color: '#666666', letterSpacing: -0.2 },
  sectionTitle: { fontFamily: 'Bricolage_600', fontSize: 14, color: '#888888', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 24 },
  sectionGroup: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  settingIcon: { marginRight: 12 },
  settingText: { flex: 1, fontFamily: 'Bricolage_500', fontSize: 16, color: '#222222', letterSpacing: -0.3 },
  settingValue: { fontFamily: 'Bricolage_400', fontSize: 14, color: '#666666', marginRight: 8 },
  logoutButton: { marginTop: 40, padding: 16, borderRadius: 12, backgroundColor: '#FFF0F0', alignItems: 'center' },
  logoutText: { fontFamily: 'Bricolage_600', fontSize: 16, color: '#FF3B30', letterSpacing: -0.3 }
});