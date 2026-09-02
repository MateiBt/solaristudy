import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function LeaderboardsScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  const isDesktop = width > 900;

  const users = [
    { rank: 1, name: 'Alex M.', score: 2450, trend: 'up' },
    { rank: 2, name: 'Sarah J.', score: 2120, trend: 'up' },
    { rank: 3, name: 'You', score: 1840, trend: 'up' },
    { rank: 4, name: 'David K.', score: 1650, trend: 'down' },
    { rank: 5, name: 'Emma W.', score: 1420, trend: 'same' },
    { rank: 6, name: 'James L.', score: 1390, trend: 'down' },
    { rank: 7, name: 'Maria S.', score: 1200, trend: 'up' },
  ];

  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return '#F59E0B'; // Gold
      case 2: return '#9CA3AF'; // Silver
      case 3: return '#B45309'; // Bronze
      default: return '#F3F4F6'; // Default Gray
    }
  };

  const getRankTextColor = (rank: number) => {
    return rank <= 3 ? '#FFFFFF' : '#6B7280';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* 1. Consistent Top Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Feather name="menu" size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={20} color="#4B5563" />
          </TouchableOpacity>
          <View style={styles.profileAvatar}>
            <Feather name="user" size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* 2. Page Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Global Rankings</Text>
        <Text style={styles.headerSubtitle}>See how you stack up against other learners.</Text>
      </View>

      {/* 3. Leaderboard Card (Bento Style) */}
      <View style={[styles.boardCard, isDesktop && styles.boardCardDesktop]}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.columnHeaderRank}>Rank</Text>
          <Text style={styles.columnHeaderName}>Student</Text>
          <Text style={styles.columnHeaderScore}>Total XP</Text>
        </View>

        {users.map((user, index) => {
          const isCurrentUser = user.name === 'You';
          const isLast = index === users.length - 1;

          return (
            <View 
              key={user.rank} 
              style={[
                styles.userRow, 
                isCurrentUser && styles.currentUserRow,
                isLast && { borderBottomWidth: 0 }
              ]}
            >
              {/* Rank Badge */}
              <View style={styles.rankContainer}>
                <View style={[styles.rankBadge, { backgroundColor: getRankColor(user.rank) }]}>
                  <Text style={[styles.rankText, { color: getRankTextColor(user.rank) }]}>
                    #{user.rank}
                  </Text>
                </View>
              </View>

              {/* Avatar & Name */}
              <View style={styles.nameContainer}>
                <View style={[styles.avatar, isCurrentUser && styles.currentUserAvatar]}>
                  <Feather name="user" size={16} color={isCurrentUser ? '#185B37' : '#9CA3AF'} />
                </View>
                <Text style={[styles.nameText, isCurrentUser && styles.currentUserText]}>
                  {user.name}
                </Text>
              </View>

              {/* Score & Trend */}
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreText, isCurrentUser && styles.currentUserText]}>
                  {user.score.toLocaleString()}
                </Text>
                <Feather 
                  name={user.trend === 'up' ? 'trending-up' : user.trend === 'down' ? 'trending-down' : 'minus'} 
                  size={16} 
                  color={isCurrentUser ? '#A7F3D0' : user.trend === 'up' ? '#10B981' : '#9CA3AF'} 
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>
          );
        })}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' // Matches Dashboard background
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
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
  headerTitle: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 32, 
    color: '#111827', 
    marginBottom: 8 
  },
  headerSubtitle: { 
    fontFamily: 'Bricolage_400', 
    fontSize: 16, 
    color: '#6B7280', 
  },
  boardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
  },
  boardCardDesktop: {
    padding: 32,
  },
  listHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  columnHeaderRank: {
    width: 60,
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  columnHeaderName: {
    flex: 1,
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  columnHeaderScore: {
    width: 100,
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  userRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  currentUserRow: { 
    backgroundColor: '#185B37', // Deep Green
    borderRadius: 16,
    paddingHorizontal: 16,
    marginHorizontal: -16, // Pulls it slightly wider to stand out
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 4,
  },
  rankContainer: { 
    width: 60,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 14, 
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#F3F4F6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  currentUserAvatar: {
    backgroundColor: '#FFFFFF',
  },
  nameText: { 
    fontFamily: 'Bricolage_500', 
    fontSize: 16, 
    color: '#111827',
  },
  scoreContainer: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scoreText: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 16, 
    color: '#111827' 
  },
  currentUserText: { 
    color: '#FFFFFF' 
  }
});