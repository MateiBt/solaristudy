import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SubjectScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const subjectId = Array.isArray(id) ? id[0] : id;
  const title = subjectId ? subjectId.charAt(0).toUpperCase() + subjectId.slice(1) : 'Subject';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#222222" />
        </TouchableOpacity>
        <Text style={styles.header}>{title}</Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton} 
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: String(subjectId) } })}
      >
        <Feather name="camera" size={24} color="#FFFFFF" style={styles.btnIcon} />
        <Text style={styles.primaryButtonText}>Start Problem Session</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Past Sessions</Text>
      
      <TouchableOpacity style={styles.chatCard} activeOpacity={0.7}>
        <View style={styles.chatInfo}>
          <Text style={styles.chatTitle}>Kinematics Question 4</Text>
          <Text style={styles.chatDate}>Today, 10:42 AM</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#CCCCCC" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.chatCard} activeOpacity={0.7}>
        <View style={styles.chatInfo}>
          <Text style={styles.chatTitle}>Newton's Second Law</Text>
          <Text style={styles.chatDate}>Yesterday</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#CCCCCC" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, marginTop: 10 },
  backButton: { marginRight: 16, padding: 8, backgroundColor: '#F5F5F5', borderRadius: 8 },
  header: { fontFamily: 'Bricolage_600', fontSize: 28, color: '#222222', letterSpacing: -0.5 },
  primaryButton: { backgroundColor: '#222222', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 12, marginBottom: 40 },
  btnIcon: { marginRight: 12 },
  primaryButtonText: { fontFamily: 'Bricolage_500', fontSize: 16, color: '#FFFFFF', letterSpacing: -0.3 },
  sectionTitle: { fontFamily: 'Bricolage_600', fontSize: 20, color: '#222222', letterSpacing: -0.4, marginBottom: 16 },
  chatCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  chatInfo: { flex: 1 },
  chatTitle: { fontFamily: 'Bricolage_500', fontSize: 16, color: '#222222', letterSpacing: -0.3, marginBottom: 4 },
  chatDate: { fontFamily: 'Bricolage_400', fontSize: 13, color: '#888888' }
});