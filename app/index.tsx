import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  const isDesktop = width > 900;

  // Mock data for the bar chart
  const weeklyData = [
    { day: 'S', height: '40%', active: false },
    { day: 'M', height: '70%', active: true },
    { day: 'T', height: '100%', active: true },
    { day: 'W', height: '60%', active: false },
    { day: 'T', height: '80%', active: false },
    { day: 'F', height: '50%', active: false },
    { day: 'S', height: '30%', active: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* 1. Top Navigation Bar (Fixes the missing menu toggle) */}
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
            placeholder="Search topics..."
            placeholderTextColor="#9CA3AF"
          />
          <View style={styles.shortcutBadge}>
            <Text style={styles.shortcutText}>⌘F</Text>
          </View>
        </View>

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
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Plan, prioritize, and accomplish your studies with ease.</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.primaryButton}>
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>New Session</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary, isDesktop && styles.statCardDesktop]}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statTitleLight}>Total Study Hours</Text>
            <View style={styles.iconCircleLight}>
              <Feather name="arrow-up-right" size={14} color="#185B37" />
            </View>
          </View>
          <Text style={styles.statValueLight}>24</Text>
          <Text style={styles.statTrendLight}>+6h from last month</Text>
        </View>

        <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statTitleDark}>Mastered Topics</Text>
            <View style={styles.iconCircleDark}>
              <Feather name="arrow-up-right" size={14} color="#4B5563" />
            </View>
          </View>
          <Text style={styles.statValueDark}>10</Text>
          <Text style={styles.statTrendDark}>+2 from last month</Text>
        </View>

        <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statTitleDark}>Current Streak</Text>
            <View style={styles.iconCircleDark}>
              <Feather name="zap" size={14} color="#4B5563" />
            </View>
          </View>
          <Text style={styles.statValueDark}>12</Text>
          <Text style={styles.statTrendDark}>Days active</Text>
        </View>

        <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statTitleDark}>Pending Reviews</Text>
            <View style={styles.iconCircleDark}>
              <Feather name="arrow-up-right" size={14} color="#4B5563" />
            </View>
          </View>
          <Text style={styles.statValueDark}>2</Text>
          <Text style={styles.statTrendDark}>Requires attention</Text>
        </View>
      </View>

      {/* 4. Main Content Grid */}
      <View style={styles.mainGrid}>
        
        {/* Left Column */}
        <View style={[styles.column, isDesktop && styles.columnLeft]}>
          
          {/* Analytics Chart Mockup */}
          <View style={styles.chartCard}>
            <Text style={styles.cardSectionTitle}>Study Analytics</Text>
            <View style={styles.barChartContainer}>
              {weeklyData.map((data, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={[styles.barTrack, data.active && styles.barTrackActive]}>
                    <View style={[styles.barFill, { height: data.height as any }, data.active && styles.barFillActive]} />
                  </View>
                  <Text style={styles.barLabel}>{data.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Action Banner */}
          <View style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>Upcoming: Quantum Mechanics</Text>
            <Text style={styles.reminderSubtitle}>Scheduled for Today • 02:00 PM</Text>
            <TouchableOpacity style={styles.startMeetingButton}>
              <Feather name="play" size={16} color="#FFFFFF" />
              <Text style={styles.startMeetingText}>Start Review</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Right Column */}
        <View style={[styles.column, isDesktop && styles.columnRight]}>
          
          {/* Task List */}
          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.cardSectionTitle}>Smart Queue</Text>
              <TouchableOpacity style={styles.newListButton}>
                <Text style={styles.newListText}>+ New</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.listItem}>
              <View style={[styles.listIconBox, { backgroundColor: '#E0E7FF' }]}>
                <Feather name="aperture" size={16} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.listTitle}>Kinematics Formulas</Text>
                <Text style={styles.listSubtitle}>Due date: Nov 26, 2024</Text>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={[styles.listIconBox, { backgroundColor: '#D1FAE5' }]}>
                <Feather name="pie-chart" size={16} color="#10B981" />
              </View>
              <View>
                <Text style={styles.listTitle}>Calculus Integration</Text>
                <Text style={styles.listSubtitle}>Due date: Nov 28, 2024</Text>
              </View>
            </View>
          </View>

          {/* Time Tracker Card */}
          <View style={styles.timerCard}>
            <Text style={styles.timerTitle}>Time Tracker</Text>
            <Text style={styles.timerClock}>01:24:08</Text>
            <View style={styles.timerControls}>
              <TouchableOpacity style={styles.timerControlButton}>
                <Feather name="pause" size={20} color="#185B37" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.timerControlButton, { backgroundColor: '#EF4444' }]}>
                <Feather name="square" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>

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
    alignSelf: 'center',
    width: '100%',
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
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 16,
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#185B37', // Deep Green
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: 'Bricolage_500',
    color: '#FFFFFF',
    fontSize: 15,
  },
  statsRow: {
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
  },
  statCardDesktop: {
    flex: 1,
    minWidth: 200,
  },
  statCardPrimary: {
    backgroundColor: '#185B37',
    borderColor: '#185B37',
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statTitleLight: {
    fontFamily: 'Bricolage_500',
    fontSize: 15,
    color: '#E6F0EB',
  },
  statTitleDark: {
    fontFamily: 'Bricolage_500',
    fontSize: 15,
    color: '#4B5563',
  },
  iconCircleLight: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleDark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValueLight: {
    fontFamily: 'Bricolage_600',
    fontSize: 48,
    color: '#FFFFFF',
    lineHeight: 56,
    marginBottom: 8,
  },
  statValueDark: {
    fontFamily: 'Bricolage_600',
    fontSize: 48,
    color: '#111827',
    lineHeight: 56,
    marginBottom: 8,
  },
  statTrendLight: {
    fontFamily: 'Bricolage_400',
    fontSize: 13,
    color: '#A7F3D0',
  },
  statTrendDark: {
    fontFamily: 'Bricolage_400',
    fontSize: 13,
    color: '#9CA3AF',
  },
  mainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  column: {
    width: '100%',
    gap: 24,
  },
  columnLeft: {
    flex: 6,
  },
  columnRight: {
    flex: 4,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardSectionTitle: {
    fontFamily: 'Bricolage_600',
    fontSize: 18,
    color: '#111827',
    marginBottom: 24,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 20,
  },
  barColumn: {
    alignItems: 'center',
    width: 32,
    height: '100%',
  },
  barTrack: {
    flex: 1,
    width: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 12,
  },
  barTrackActive: {
    backgroundColor: '#E6F0EB', // Soft green background
  },
  barFill: {
    width: '100%',
    backgroundColor: '#D1D5DB', 
    borderRadius: 16,
  },
  barFillActive: {
    backgroundColor: '#185B37', // Solid Green
  },
  barLabel: {
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#6B7280',
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reminderTitle: {
    fontFamily: 'Bricolage_600',
    fontSize: 20,
    color: '#185B37',
    marginBottom: 8,
  },
  reminderSubtitle: {
    fontFamily: 'Bricolage_400',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  startMeetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#185B37',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  startMeetingText: {
    fontFamily: 'Bricolage_500',
    color: '#FFFFFF',
    fontSize: 15,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  newListButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  newListText: {
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#4B5563',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  listIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listTitle: {
    fontFamily: 'Bricolage_500',
    fontSize: 15,
    color: '#111827',
    marginBottom: 4,
  },
  listSubtitle: {
    fontFamily: 'Bricolage_400',
    fontSize: 13,
    color: '#9CA3AF',
  },
  timerCard: {
    backgroundColor: '#0F3E24', // Deepest green gradient base
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTitle: {
    fontFamily: 'Bricolage_500',
    fontSize: 16,
    color: '#E6F0EB',
    marginBottom: 12,
  },
  timerClock: {
    fontFamily: 'Bricolage_600',
    fontSize: 48,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 24,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16,
  },
  timerControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});