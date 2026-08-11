import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LeaderboardsScreen() {
  const users = [
    { rank: 1, name: 'Alex M.', score: 2450 },
    { rank: 2, name: 'Sarah J.', score: 2120 },
    { rank: 3, name: 'You', score: 1840 },
    { rank: 4, name: 'David K.', score: 1650 },
    { rank: 5, name: 'Emma W.', score: 1420 },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Rankings</Text>
        <Text style={styles.subtitle}>See how you stack up globally.</Text>
      </View>

      <View style={styles.listContainer}>
        {users.map((user) => (
          <View key={user.rank} style={[styles.userRow, user.name === 'You' && styles.currentUserRow]}>
            <View style={styles.rankContainer}>
              <Text style={[styles.rankText, user.name === 'You' && styles.currentUserText]}>#{user.rank}</Text>
            </View>
            <View style={styles.avatar}>
              <Feather name="user" size={16} color={user.name === 'You' ? '#FFFFFF' : '#666666'} />
            </View>
            <Text style={[styles.nameText, user.name === 'You' && styles.currentUserText]}>{user.name}</Text>
            <Text style={[styles.scoreText, user.name === 'You' && styles.currentUserText]}>{user.score} XP</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  headerContainer: { marginBottom: 32, marginTop: 10 },
  header: { fontFamily: 'Bricolage_600', fontSize: 32, color: '#222222', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontFamily: 'Bricolage_400', fontSize: 16, color: '#666666', letterSpacing: -0.2 },
  listContainer: { borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, overflow: 'hidden' },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  currentUserRow: { backgroundColor: '#222222' },
  rankContainer: { width: 40 },
  rankText: { fontFamily: 'Bricolage_600', fontSize: 16, color: '#666666' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  nameText: { flex: 1, fontFamily: 'Bricolage_500', fontSize: 16, color: '#222222', letterSpacing: -0.3 },
  scoreText: { fontFamily: 'Bricolage_600', fontSize: 16, color: '#222222' },
  currentUserText: { color: '#FFFFFF' }
});