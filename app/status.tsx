import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function StatusScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  const isDesktop = width > 900;

  const subjectProgress = [
    { name: 'Physics', percent: 72, color: '#9B51E0', bgColor: '#F0E6FF', icon: 'aperture' },
    { name: 'Mathematics', percent: 45, color: '#FF4D4D', bgColor: '#FFE8E8', icon: 'pie-chart' },
    { name: 'Astronomy', percent: 15, color: '#2D9CDB', bgColor: '#E6F4FE', icon: 'moon' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {}
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
            placeholder="Search progress..."
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

      {}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Progress</Text>
        <Text style={styles.subtitle}>Track your learning journey and milestones.</Text>
      </View>

      {}
      <View style={styles.statsRow}>
        
        {}
        <View style={[styles.statCard, styles.statCardPrimary, isDesktop && styles.statCardDesktop]}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statTitleLight}>Total Hours Studied</Text>
            <View style={styles.iconCircleLight}>
              <Feather name="target" size={14} color="#185B37" />
            </View>
          </View>
          <Text style={styles.statValueLight}>14h</Text>
          <Text style={styles.statTrendLight}>On track for weekly goal</Text>
        </View>

        {}
        <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statTitleDark}>Current Rank</Text>
            <View style={styles.iconCircleDark}>
              <Feather name="award" size={14} color="#4B5563" />
            </View>
          </View>
          <Text style={styles.statValueDark}>Level 4</Text>
          <Text style={styles.statTrendDark}>Scholar Rank</Text>
        </View>

      </View>

      {}
      <Text style={styles.sectionTitle}>Subject Mastery</Text>
      <View style={styles.masteryCard}>
        {subjectProgress.map((subject, index) => {
          const isLast = index === subjectProgress.length - 1;
          
          return (
            <View key={subject.name} style={[styles.progressRow, isLast && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              
              <View style={[styles.subjectIconBox, { backgroundColor: subject.bgColor }]}>
                <Feather name={subject.icon as any} size={20} color={subject.color} />
              </View>

              <View style={styles.progressDataContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>{subject.name}</Text>
                  <Text style={[styles.progressPercent, { color: subject.color }]}>{subject.percent}%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${subject.percent}%`, backgroundColor: subject.color }]} />
                </View>
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
    backgroundColor: '#F9FAFB' 
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
    marginBottom: 32 
  },
  header: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 32, 
    color: '#111827', 
    letterSpacing: -0.5, 
    marginBottom: 8 
  },
  subtitle: { 
    fontFamily: 'Bricolage_400', 
    fontSize: 16, 
    color: '#6B7280', 
  },
  statsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 16, 
    marginBottom: 40 
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
  sectionTitle: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 20, 
    color: '#111827', 
    marginBottom: 16 
  },
  masteryCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subjectIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressDataContainer: {
    flex: 1,
  },
  progressHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12 
  },
  progressTitle: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 16, 
    color: '#111827', 
  },
  progressPercent: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 16, 
  },
  progressBarBackground: { 
    height: 8, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%', 
    borderRadius: 4 
  }
});