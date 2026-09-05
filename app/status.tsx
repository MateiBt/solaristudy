import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { getDashboardMetrics, getSubjectHubMetrics, getUserProfile } from '../lib/db';
import { SUBJECT_LIST } from '../lib/subjects';

export default function StatusScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 900;

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [globalMetrics, setGlobalMetrics] = useState<any>(null);
  const [subjectMetrics, setSubjectMetrics] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const [userProfile, dashMetrics, hubMetrics] = await Promise.all([
        getUserProfile(),
        getDashboardMetrics(),
        getSubjectHubMetrics()
      ]);
      setProfile(userProfile);
      setGlobalMetrics(dashMetrics);
      setSubjectMetrics(hubMetrics.subjectMetrics);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const mockWeeklyData = [
    { day: 'Mon', hours: 1.2 },
    { day: 'Tue', hours: 2.5 },
    { day: 'Wed', hours: 1.8 },
    { day: 'Thu', hours: 3.1 },
    { day: 'Fri', hours: 0.5 },
    { day: 'Sat', hours: 4.0 },
    { day: 'Sun', hours: 2.2 },
  ];
  const maxMockHours = 4.0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.topNav}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Feather name="menu" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="share-2" size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Progress</Text>
        <Text style={styles.headerSubtitle}>Track your learning milestones and focus distribution.</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#185B37" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.overviewGrid}>
            <View style={[styles.statCard, isLargeScreen && styles.statCardDesktop]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIconBox, { backgroundColor: '#E6F0EB' }]}>
                  <Feather name="clock" size={18} color="#185B37" />
                </View>
              </View>
              <Text style={styles.statValue}>{globalMetrics?.totalFocusHours || '0.0'}<Text style={styles.statUnit}>h</Text></Text>
              <Text style={styles.statLabel}>Total Focus Time</Text>
            </View>

            <View style={[styles.statCard, isLargeScreen && styles.statCardDesktop]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIconBox, { backgroundColor: '#F3F4F6' }]}>
                  <Feather name="check-circle" size={18} color="#4B5563" />
                </View>
              </View>
              <Text style={styles.statValue}>{globalMetrics?.totalProblems || 0}</Text>
              <Text style={styles.statLabel}>Problems Solved</Text>
            </View>

            <View style={[styles.statCard, isLargeScreen && styles.statCardDesktop]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Feather name="zap" size={18} color="#D97706" />
                </View>
              </View>
              <Text style={styles.statValue}>{profile?.streak_count || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={[styles.statCard, isLargeScreen && styles.statCardDesktop]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Feather name="target" size={18} color="#2563EB" />
                </View>
              </View>
              <Text style={styles.statValue}>{globalMetrics?.globalAccuracy || 0}<Text style={styles.statUnit}>%</Text></Text>
              <Text style={styles.statLabel}>Global Accuracy</Text>
            </View>
          </View>

          <View style={styles.sectionsRow}>
            <View style={[styles.sectionCard, isLargeScreen && styles.sectionCardDesktop]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Weekly Activity</Text>
                <Text style={styles.sectionSubtitle}>Focus hours over the last 7 days</Text>
              </View>
              <View style={styles.chartContainer}>
                {mockWeeklyData.map((data, index) => {
                  const heightPercent = (data.hours / maxMockHours) * 100;
                  return (
                    <View key={index} style={styles.chartColumn}>
                      <View style={styles.barWrapper}>
                        <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                      </View>
                      <Text style={styles.chartDayLabel}>{data.day}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={[styles.sectionCard, isLargeScreen && styles.sectionCardDesktop]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Subject Distribution</Text>
                <Text style={styles.sectionSubtitle}>Time and engagement by topic</Text>
              </View>
              <View style={styles.distributionList}>
                {SUBJECT_LIST.map(subject => {
                  const stats = subjectMetrics[subject.id] || { hours: '0.0h', chats: 0 };
                  const numericHours = parseFloat(stats.hours.replace('h', '')) || 0;
                  const globalHours = parseFloat(globalMetrics?.totalFocusHours || '1');
                  const fillPercent = globalHours > 0 ? (numericHours / globalHours) * 100 : 0;
                  
                  return (
                    <View key={subject.id} style={styles.distributionRow}>
                      <View style={[styles.distributionIcon, { backgroundColor: subject.bgColor }]}>
                        <Feather name={subject.icon as any} size={16} color={subject.color} />
                      </View>
                      <View style={styles.distributionDetails}>
                        <View style={styles.distHeaderRow}>
                          <Text style={styles.distTitle}>{subject.name}</Text>
                          <Text style={styles.distStats}>{stats.hours} • {stats.chats} sessions</Text>
                        </View>
                        <View style={styles.distTrack}>
                          <View style={[styles.distFill, { width: `${Math.min(fillPercent, 100)}%`, backgroundColor: subject.color }]} />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 64,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    zIndex: 50,
  },
  menuButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  headerContainer: {
    marginBottom: 40,
  },
  headerTitle: {
    fontFamily: 'Bricolage_600',
    fontSize: 32,
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Bricolage_400',
    fontSize: 16,
    color: '#6B7280',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  statCardDesktop: {
    flex: 1,
    minWidth: 220,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Bricolage_600',
    fontSize: 40,
    color: '#111827',
    lineHeight: 48,
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 20,
    color: '#6B7280',
  },
  statLabel: {
    fontFamily: 'Bricolage_500',
    fontSize: 14,
    color: '#6B7280',
  },
  sectionsRow: {
    flexDirection: 'column',
    gap: 24,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  sectionCardDesktop: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Bricolage_600',
    fontSize: 20,
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Bricolage_400',
    fontSize: 14,
    color: '#6B7280',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    paddingTop: 16,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: 32,
    height: 140,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'flex-end',
    marginBottom: 12,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#185B37',
    borderRadius: 8,
  },
  chartDayLabel: {
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#9CA3AF',
  },
  distributionList: {
    gap: 20,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  distributionDetails: {
    flex: 1,
  },
  distHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distTitle: {
    fontFamily: 'Bricolage_600',
    fontSize: 15,
    color: '#111827',
  },
  distStats: {
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#6B7280',
  },
  distTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distFill: {
    height: '100%',
    borderRadius: 4,
  }
});