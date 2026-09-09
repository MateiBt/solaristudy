import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { getGlobalLeaderboard } from '../lib/db';
import { SUBJECT_LIST } from '../lib/subjects';
import { supabase } from '../lib/supabase';
import { LeaderboardEntry } from '../lib/types';

export default function LeaderboardsScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const [activeMetric, setActiveMetric] = useState<'Total Solved' | 'Accuracy'>('Total Solved');
  const [activeSubject, setActiveSubject] = useState<string>('global');
  
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

        // Pass the activeSubject to the fetch function
        const data = await getGlobalLeaderboard(50, activeSubject);
        setLeaderboardData(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [activeSubject]);

  const topThree = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);
  
  const myRankIndex = leaderboardData.findIndex(u => u.id === currentUserId);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : '-';
  const myData = leaderboardData[myRankIndex] || { display_name: 'Anonymous Scholar', total_problems_solved: 0, global_accuracy: 0 };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}>
            <Feather color="#111827" name="menu" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Leaderboards</Text>
          <Text style={styles.headerSubtitle}>See how you stack up against top scholars.</Text>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.metricsTabs}>
            {(['Total Solved', 'Accuracy'] as const).map(metric => (
              <TouchableOpacity 
                key={metric} 
                onPress={() => setActiveMetric(metric)} 
                style={[styles.metricTab, activeMetric === metric && styles.metricTabActive]}
              >
                <Text style={[styles.metricTabText, activeMetric === metric && styles.metricTabTextActive]}>
                  {metric}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.subjectsContainer} horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsScroll}>
            <TouchableOpacity 
              onPress={() => setActiveSubject('global')} 
              style={[styles.subjectChip, activeSubject === 'global' && styles.subjectChipActive]}
            >
              <Text style={[styles.subjectChipText, activeSubject === 'global' && styles.subjectChipTextActive]}>Global</Text>
            </TouchableOpacity>
            {SUBJECT_LIST.map(sub => (
              <TouchableOpacity 
                key={sub.id} 
                onPress={() => setActiveSubject(sub.id)} 
                style={[
                  styles.subjectChip, 
                  { borderColor: sub.color }, 
                  activeSubject === sub.id && { backgroundColor: sub.bgColor, borderColor: sub.color }
                ]}
              >
                <Text style={[styles.subjectChipText, activeSubject === sub.id && styles.subjectChipTextActive]}>
                  {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.boardContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#185B37" style={{ marginVertical: 40 }} />
          ) : leaderboardData.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#6B7280', marginVertical: 40 }}>No scholars found yet.</Text>
          ) : (
            <>
              <View style={styles.podiumRow}>
                {topThree[1] && (
                  <View style={[styles.podiumItem, styles.podiumSecond]}>
                    <View style={styles.avatarWrapper}>
                      {topThree[1].avatar_url ? (
                        <Image source={{ uri: topThree[1].avatar_url }} style={styles.avatarImage} />
                      ) : (
                        <View style={[styles.avatarImage, { justifyContent: 'center', alignItems: 'center' }]}>
                          <Feather color="#9CA3AF" name="user" size={24} />
                        </View>
                      )}
                      <View style={[styles.rankBadge, { backgroundColor: '#9CA3AF' }]}>
                        <Text style={styles.rankBadgeText}>2</Text>
                      </View>
                    </View>
                    <Text numberOfLines={1} style={styles.podiumName}>
                      {topThree[1].id === currentUserId ? 'You' : topThree[1].display_name}
                    </Text>
                    <Text style={styles.podiumScore}>
                      {activeMetric === 'Total Solved' ? topThree[1].total_problems_solved : `${Math.round(topThree[1].global_accuracy)}%`}
                    </Text>
                  </View>
                )}

                {topThree[0] && (
                  <View style={[styles.podiumItem, styles.podiumFirst]}>
                    <View style={styles.avatarWrapper}>
                      {topThree[0].avatar_url ? (
                        <Image 
                          source={{ uri: topThree[0].avatar_url }} 
                          style={[styles.avatarImage, { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#F59E0B' }]} 
                        />
                      ) : (
                        <View style={[styles.avatarImage, { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#F59E0B', justifyContent: 'center', alignItems: 'center' }]}>
                          <Feather color="#9CA3AF" name="user" size={32} />
                        </View>
                      )}
                      <View style={[styles.rankBadge, { width: 28, height: 28, borderRadius: 14, bottom: -4, backgroundColor: '#F59E0B' }]}>
                        <Text style={[styles.rankBadgeText, { fontSize: 14 }]}>1</Text>
                      </View>
                    </View>
                    <Text numberOfLines={1} style={[styles.podiumName, { fontSize: 18, marginTop: 18 }]}>
                      {topThree[0].id === currentUserId ? 'You' : topThree[0].display_name}
                    </Text>
                    <Text style={[styles.podiumScore, { fontSize: 16, color: '#F59E0B' }]}>
                      {activeMetric === 'Total Solved' ? topThree[0].total_problems_solved : `${Math.round(topThree[0].global_accuracy)}%`}
                    </Text>
                  </View>
                )}

                {topThree[2] && (
                  <View style={[styles.podiumItem, styles.podiumThird]}>
                    <View style={styles.avatarWrapper}>
                      {topThree[2].avatar_url ? (
                        <Image source={{ uri: topThree[2].avatar_url }} style={styles.avatarImage} />
                      ) : (
                        <View style={[styles.avatarImage, { justifyContent: 'center', alignItems: 'center' }]}>
                          <Feather color="#9CA3AF" name="user" size={24} />
                        </View>
                      )}
                      <View style={[styles.rankBadge, { backgroundColor: '#B45309' }]}>
                        <Text style={styles.rankBadgeText}>3</Text>
                      </View>
                    </View>
                    <Text numberOfLines={1} style={styles.podiumName}>
                      {topThree[2].id === currentUserId ? 'You' : topThree[2].display_name}
                    </Text>
                    <Text style={styles.podiumScore}>
                      {activeMetric === 'Total Solved' ? topThree[2].total_problems_solved : `${Math.round(topThree[2].global_accuracy)}%`}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.listContainer}>
                {remaining.map((user, index) => {
                  const actualRank = index + 4;
                  const isMe = user.id === currentUserId;
                  
                  return (
                    <View key={user.id} style={[styles.listItem, isMe && styles.listItemMe]}>
                      <Text style={styles.listRank}>{actualRank}</Text>
                      <View style={styles.listAvatar}>
                        {user.avatar_url ? (
                          <Image source={{ uri: user.avatar_url }} style={styles.listAvatarImage} />
                        ) : (
                          <Feather color="#FFFFFF" name="user" size={16} />
                        )}
                      </View>
                      <Text numberOfLines={1} style={[styles.listName, isMe && styles.listNameMe]}>
                        {isMe ? 'You' : user.display_name}
                      </Text>
                      <Text style={[styles.listScore, isMe && styles.listScoreMe]}>
                        {activeMetric === 'Total Solved' ? user.total_problems_solved : `${Math.round(user.global_accuracy)}%`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {!isLoading && currentUserId && (
        <View style={styles.stickyFooter}>
          <View style={styles.stickyContent}>
            <Text style={styles.listRank}>{myRank}</Text>
            <View style={[styles.listAvatar, { backgroundColor: '#185B37' }]}>
              {myData.avatar_url ? (
                <Image source={{ uri: myData.avatar_url }} style={styles.listAvatarImage} />
              ) : (
                <Feather color="#FFFFFF" name="user" size={16} />
              )}
            </View>
            <Text numberOfLines={1} style={[styles.listName, styles.listNameMe]}>
              You
            </Text>
            <Text style={[styles.listScore, styles.listScoreMe]}>
              {activeMetric === 'Total Solved' ? myData.total_problems_solved : `${Math.round(myData.global_accuracy)}%`}
            </Text>
          </View>
        </View>
      )}
    </View>
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
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 100,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  menuButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerContainer: {
    marginBottom: 32,
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
  filtersContainer: {
    marginBottom: 32,
  },
  metricsTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  metricTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  metricTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricTabText: {
    fontFamily: 'Bricolage_500',
    fontSize: 14,
    color: '#6B7280',
  },
  metricTabTextActive: {
    color: '#111827',
    fontFamily: 'Bricolage_600',
  },
  subjectsScroll: {
    flexGrow: 0,
  },
  subjectsContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  subjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subjectChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  subjectChipText: {
    fontFamily: 'Bricolage_500',
    fontSize: 14,
    color: '#4B5563',
  },
  subjectChipTextActive: {
    color: '#FFFFFF',
  },
  boardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
    marginTop: 16,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumFirst: {
    marginBottom: 16,
    zIndex: 10,
  },
  podiumSecond: {
    opacity: 0.9,
  },
  podiumThird: {
    opacity: 0.8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankBadgeText: {
    fontFamily: 'Bricolage_600',
    fontSize: 12,
    color: '#FFFFFF',
  },
  podiumName: {
    fontFamily: 'Bricolage_600',
    fontSize: 15,
    color: '#111827',
    marginBottom: 4,
  },
  podiumScore: {
    fontFamily: 'Bricolage_500',
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  listItemMe: {
    backgroundColor: '#F9FAFB',
  },
  listRank: {
    fontFamily: 'Bricolage_600',
    fontSize: 15,
    color: '#9CA3AF',
    width: 32,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  listAvatarImage: {
    width: '100%',
    height: '100%',
  },
  listName: {
    flex: 1,
    fontFamily: 'Bricolage_500',
    fontSize: 15,
    color: '#374151',
  },
  listNameMe: {
    fontFamily: 'Bricolage_600',
    color: '#111827',
  },
  listScore: {
    fontFamily: 'Bricolage_600',
    fontSize: 15,
    color: '#6B7280',
  },
  listScoreMe: {
    color: '#185B37',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  stickyContent: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  }
});