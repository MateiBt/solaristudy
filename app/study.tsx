import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StudyEngine() {
  const router = useRouter();

  const subjects = [
    { id: 'math', name: 'Mathematics', icon: 'pie-chart' },
    { id: 'physics', name: 'Physics', icon: 'aperture' },
    { id: 'astronomy', name: 'Astronomy', icon: 'moon' },
    { id: 'linguistics', name: 'Linguistics', icon: 'message-circle' },
    { id: 'general', name: 'General Tutor', icon: 'cpu' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Choose a Subject</Text>
        <Text style={styles.subtitle}>What are we focusing on today?</Text>
      </View>
      
      <View style={styles.grid}>
        {subjects.map((subject) => (
          <TouchableOpacity 
            key={subject.id} 
            style={styles.card}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: subject.id } })}
            activeOpacity={0.7}
          >
            <Feather name={subject.icon as any} size={36} color="#222222" style={styles.icon} />
            <Text style={styles.cardText}>{subject.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  headerContainer: { marginBottom: 30, marginTop: 10 },
  header: { fontFamily: 'Bricolage_600', fontSize: 32, color: '#222222', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontFamily: 'Bricolage_400', fontSize: 16, color: '#666666', letterSpacing: -0.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '47%', backgroundColor: '#FFFFFF', paddingVertical: 25, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', alignItems: 'center', marginBottom: 16 },
  icon: { marginBottom: 12 },
  cardText: { fontFamily: 'Bricolage_500', fontSize: 16, color: '#444444', letterSpacing: -0.3, textAlign: 'center' }
});