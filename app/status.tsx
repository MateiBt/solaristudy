import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function StatusScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Progress</Text>
        <Text style={styles.subtitle}>Track your learning journey.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Feather name="target" size={24} color="#222222" style={styles.statIcon} />
          <View>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>Hours Studied</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <Feather name="award" size={24} color="#222222" style={styles.statIcon} />
          <View>
            <Text style={styles.statValue}>Level 4</Text>
            <Text style={styles.statLabel}>Scholar Rank</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Subject Mastery</Text>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Physics</Text>
          <Text style={styles.progressPercent}>72%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '72%', backgroundColor: '#222222' }]} />
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Mathematics</Text>
          <Text style={styles.progressPercent}>45%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '45%', backgroundColor: '#222222' }]} />
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Astronomy</Text>
          <Text style={styles.progressPercent}>15%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '15%', backgroundColor: '#222222' }]} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  headerContainer: { marginBottom: 32, marginTop: 10 },
  header: { fontFamily: 'Bricolage_600', fontSize: 32, color: '#222222', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontFamily: 'Bricolage_400', fontSize: 16, color: '#666666', letterSpacing: -0.2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  statBox: { width: '48%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA' },
  statIcon: { marginRight: 12 },
  statValue: { fontFamily: 'Bricolage_600', fontSize: 18, color: '#222222', letterSpacing: -0.3 },
  statLabel: { fontFamily: 'Bricolage_400', fontSize: 12, color: '#666666', marginTop: 2 },
  sectionTitle: { fontFamily: 'Bricolage_600', fontSize: 20, color: '#222222', letterSpacing: -0.4, marginBottom: 16 },
  progressCard: { marginBottom: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontFamily: 'Bricolage_500', fontSize: 16, color: '#222222', letterSpacing: -0.3 },
  progressPercent: { fontFamily: 'Bricolage_600', fontSize: 16, color: '#222222' },
  progressBarBackground: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 }
});