import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  
  const heatmapData = Array.from({ length: 28 }).map((_, i) => {
    if (i > 24) return 0; 
    return Math.floor(Math.random() * 4);
  });

  const getHeatmapColor = (intensity: number) => {
    switch(intensity) {
      case 3: return '#007AFF';
      case 2: return '#66B2FF';
      case 1: return '#CCE5FF';
      default: return '#F0F0F0';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.dateLabel}>TUESDAY, OCT 24</Text>
          <Text style={styles.greeting}>Good morning, Alex.</Text>
        </View>
        <TouchableOpacity style={styles.profileAvatar}>
          <Feather name="user" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.masterStatCard}>
        <View style={styles.streakHeaderRow}>
          <View style={styles.streakTitleContainer}>
            <View style={styles.streakIconContainer}>
              <Feather name="zap" size={20} color="#FF8C00" />
            </View>
            <Text style={styles.streakTitle}>7 Day Streak</Text>
          </View>
          <Text style={styles.streakSubtitle}>Keep it up!</Text>
        </View>

        <View style={styles.streakBarBackground}>
          <View style={[styles.streakBarFill, { width: '70%' }]} />
        </View>

        <View style={styles.dailyMetricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>2.5h</Text>
            <Text style={styles.metricLabel}>Focused</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>14</Text>
            <Text style={styles.metricLabel}>Attempted</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>92%</Text>
            <Text style={styles.metricLabel}>Avg Score</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Activity Graph</Text>
      <View style={styles.heatmapCard}>
        <View style={styles.heatmapGrid}>
          {heatmapData.map((val, idx) => (
            <View 
              key={idx} 
              style={[styles.heatmapBlock, { backgroundColor: getHeatmapColor(val) }]} 
            />
          ))}
        </View>
        <View style={styles.heatmapLegend}>
          <Text style={styles.legendText}>Less</Text>
          <View style={[styles.legendBlock, { backgroundColor: '#F0F0F0' }]} />
          <View style={[styles.legendBlock, { backgroundColor: '#CCE5FF' }]} />
          <View style={[styles.legendBlock, { backgroundColor: '#66B2FF' }]} />
          <View style={[styles.legendBlock, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Smart Queue</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.queueItem} activeOpacity={0.7} onPress={() => router.push({ pathname: '/subject/[id]', params: { id: 'physics' } })}>
        <View style={[styles.queueIconBox, { backgroundColor: '#FFF4E5' }]}>
          <Feather name="refresh-cw" size={18} color="#FF8C00" />
        </View>
        <View style={styles.queueTextContainer}>
          <Text style={styles.queueTitle}>Spaced Review: Kinematics</Text>
          <Text style={styles.queueSubtitle}>Due today • 4 problems</Text>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Feather name="play" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity style={styles.queueItem} activeOpacity={0.7} onPress={() => router.push({ pathname: '/subject/[id]', params: { id: 'math' } })}>
        <View style={[styles.queueIconBox, { backgroundColor: '#E5F0FF' }]}>
          <Feather name="book-open" size={18} color="#007AFF" />
        </View>
        <View style={styles.queueTextContainer}>
          <Text style={styles.queueTitle}>Continue: Integration</Text>
          <Text style={styles.queueSubtitle}>You left off at Q2</Text>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Feather name="play" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Quick Tools</Text>
      <View style={styles.toolsGrid}>
        <TouchableOpacity style={styles.toolCard} activeOpacity={0.7}>
          <View style={styles.toolIconContainer}>
            <Feather name="file-text" size={24} color="#222222" />
          </View>
          <Text style={styles.toolTitle}>Formulas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolCard} activeOpacity={0.7}>
          <View style={styles.toolIconContainer}>
            <Feather name="pie-chart" size={24} color="#222222" />
          </View>
          <Text style={styles.toolTitle}>Analytics</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  dateLabel: { fontFamily: 'Bricolage_500', fontSize: 12, color: '#888888', letterSpacing: 1, marginBottom: 4 },
  greeting: { fontFamily: 'Bricolage_600', fontSize: 28, color: '#222222', letterSpacing: -0.5 },
  profileAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222222', justifyContent: 'center', alignItems: 'center' },
  
  masterStatCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEA', padding: 20, marginBottom: 32 },
  streakHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  streakTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  streakIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF4E5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  streakTitle: { fontFamily: 'Bricolage_600', fontSize: 20, color: '#222222', letterSpacing: -0.3 },
  streakSubtitle: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#FF8C00' },
  streakBarBackground: { height: 8, backgroundColor: '#FFF4E5', borderRadius: 4, overflow: 'hidden', marginBottom: 24 },
  streakBarFill: { height: '100%', backgroundColor: '#FF8C00', borderRadius: 4 },
  
  dailyMetricsGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricItem: { flex: 1, alignItems: 'center' },
  metricValue: { fontFamily: 'Bricolage_600', fontSize: 22, color: '#222222', letterSpacing: -0.5, marginBottom: 4 },
  metricLabel: { fontFamily: 'Bricolage_400', fontSize: 13, color: '#666666' },
  metricDivider: { width: 1, height: 30, backgroundColor: '#EAEAEA' },
  
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Bricolage_600', fontSize: 20, color: '#222222', letterSpacing: -0.4, marginBottom: 16, marginTop: 8 },
  seeAllText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#007AFF' },

  heatmapCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEA', padding: 20, marginBottom: 32 },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  heatmapBlock: { width: 16, height: 16, borderRadius: 4 },
  heatmapLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  legendText: { fontFamily: 'Bricolage_400', fontSize: 12, color: '#888888', paddingHorizontal: 4 },
  legendBlock: { width: 12, height: 12, borderRadius: 3 },

  queueItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 12 },
  queueIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  queueTextContainer: { flex: 1 },
  queueTitle: { fontFamily: 'Bricolage_500', fontSize: 16, color: '#222222', letterSpacing: -0.3, marginBottom: 4 },
  queueSubtitle: { fontFamily: 'Bricolage_400', fontSize: 13, color: '#666666' },
  playButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#222222', justifyContent: 'center', alignItems: 'center', paddingLeft: 2 },

  toolsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  toolCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', alignItems: 'center' },
  toolIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  toolTitle: { fontFamily: 'Bricolage_500', fontSize: 15, color: '#444444', letterSpacing: -0.3 }
});