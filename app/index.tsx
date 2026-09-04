import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { getDashboardMetrics, getSessions, getUserProfile, globalSearch } from '../lib/db';
import { SUBJECT_LIST, SUBJECT_REGISTRY, SubjectConfig } from '../lib/subjects';
import { ChatSession, SearchResult } from '../lib/types';

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  const isDesktop = width > 900;
  const isTablet = width > 600 && width <= 900;

  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalFocusHours: '0.0', totalProblems: 0, globalAccuracy: 0 });
  const [streak, setStreak] = useState(0);
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [pinnedSessions, setPinnedSessions] = useState<ChatSession[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const results = await globalSearch(searchQuery);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      const [fetchedMetrics, profile, allSessions] = await Promise.all([
        getDashboardMetrics(),
        getUserProfile(),
        getSessions('physics')
      ]);

      setMetrics(fetchedMetrics);
      if (profile) setStreak(profile.streak_count);

      const active = allSessions.filter(s => !s.is_archived);
      setPinnedSessions(active.filter(s => s.is_favorited).slice(0, 5));
      setRecentSessions(active.slice(0, 5));
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderSessionCard = (session: ChatSession, isPinned = false) => (
    <TouchableOpacity 
      key={session.id} 
      style={styles.sessionCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${session.subject_id}?sessionId=${session.id}` as any)}
    >
      <View style={styles.sessionCardHeader}>
        <View style={[styles.sessionIconBox, isPinned && { backgroundColor: '#FEF3C7' }]}>
          <Feather name={isPinned ? "star" : "clock"} size={16} color={isPinned ? "#D97706" : "#4B5563"} />
        </View>
        <Text style={styles.sessionModePill}>{session.mode === 'SolariSolve' ? 'Solve' : 'Learn'}</Text>
      </View>
      <Text style={styles.sessionCardTitle} numberOfLines={2}>{session.title}</Text>
      <Text style={styles.sessionCardDate}>
        {new Date(session.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      <View style={styles.topNav}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Feather name="menu" size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search sessions, folders, or topics..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => {
                if (searchQuery.trim().length > 1) setShowSearchResults(true);
              }}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />
            {Platform.OS === 'web' && (
              <View style={styles.shortcutBadge}>
                <Text style={styles.shortcutText}>⌘F</Text>
              </View>
            )}
          </View>

          {showSearchResults && (
            <View style={styles.searchResultsDropdown}>
              {isSearching ? (
                <ActivityIndicator color="#185B37" style={{ padding: 16 }} />
              ) : searchResults.length === 0 ? (
                <Text style={styles.noResultsText}>No results found.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
                  {searchResults.map((result) => (
                    <TouchableOpacity
                      key={`${result.type}-${result.id}`}
                      style={styles.searchResultItem}
                      onPress={() => {
                        setShowSearchResults(false);
                        setSearchQuery('');
                        if (result.type === 'session') {
                          router.push(`/chat/${result.subject_id}?sessionId=${result.id}` as any);
                        } else {
                          router.push(`/subject/${result.subject_id}` as any);
                        }
                      }}
                    >
                      <View style={[styles.searchResultIcon, { backgroundColor: result.type === 'session' ? '#EFF6FF' : '#F3F4F6' }]}>
                        <Feather name={result.type === 'session' ? 'message-circle' : 'folder'} size={14} color={result.type === 'session' ? '#2563EB' : '#4B5563'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.searchResultTitle} numberOfLines={1}>{result.title}</Text>
                        <Text style={styles.searchResultSub}>{result.type === 'session' ? 'Session' : 'Folder'} • {SUBJECT_REGISTRY[result.subject_id]?.name || result.subject_id}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
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

      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Solari Dashboard</Text>
          <Text style={styles.headerSubtitle}>Plan, prioritize, and accomplish your studies with ease.</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#185B37" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary, (isDesktop || isTablet) && styles.statCardDesktop]}>
              <View style={styles.statHeaderRow}>
                <Text style={styles.statTitleLight}>Focus Time</Text>
                <View style={styles.iconCircleLight}>
                  <Feather name="clock" size={14} color="#185B37" />
                </View>
              </View>
              <Text style={styles.statValueLight}>{metrics.totalFocusHours} <Text style={{fontSize: 24}}>hrs</Text></Text>
              <Text style={styles.statTrendLight}>Actual time logged</Text>
            </View>

            <View style={[styles.statCard, (isDesktop || isTablet) && styles.statCardDesktop]}>
              <View style={styles.statHeaderRow}>
                <Text style={styles.statTitleDark}>Problems Solved</Text>
                <View style={styles.iconCircleDark}>
                  <Feather name="check-circle" size={14} color="#4B5563" />
                </View>
              </View>
              <Text style={styles.statValueDark}>{metrics.totalProblems}</Text>
              <Text style={styles.statTrendDark}>Across all subjects</Text>
            </View>

            <View style={[styles.statCard, (isDesktop || isTablet) && styles.statCardDesktop]}>
              <View style={styles.statHeaderRow}>
                <Text style={styles.statTitleDark}>Global Accuracy</Text>
                <View style={styles.iconCircleDark}>
                  <Feather name="target" size={14} color="#4B5563" />
                </View>
              </View>
              <Text style={styles.statValueDark}>{metrics.globalAccuracy}%</Text>
              <Text style={styles.statTrendDark}>Curated graded attempts</Text>
            </View>

            <View style={[styles.statCard, (isDesktop || isTablet) && styles.statCardDesktop]}>
              <View style={styles.statHeaderRow}>
                <Text style={styles.statTitleDark}>Current Streak</Text>
                <View style={styles.iconCircleDark}>
                  <Feather name="zap" size={14} color="#D97706" />
                </View>
              </View>
              <Text style={styles.statValueDark}>{streak}</Text>
              <Text style={styles.statTrendDark}>Consecutive days active</Text>
            </View>
          </View>

          <View style={styles.decksContainer}>
            <View style={styles.deckSection}>
              <View style={styles.deckHeader}>
                <Text style={styles.deckTitle}>Continue Studying</Text>
              </View>
              {recentSessions.length === 0 ? (
                <View style={styles.emptyDeck}><Text style={styles.emptyDeckText}>No recent sessions.</Text></View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deckScroll}>
                  {recentSessions.map(s => renderSessionCard(s, false))}
                </ScrollView>
              )}
            </View>

            <View style={styles.deckSection}>
              <View style={styles.deckHeader}>
                <Text style={styles.deckTitle}>Pinned Sessions</Text>
              </View>
              {pinnedSessions.length === 0 ? (
                <View style={styles.emptyDeck}><Text style={styles.emptyDeckText}>Star a session to pin it here.</Text></View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deckScroll}>
                  {pinnedSessions.map(s => renderSessionCard(s, true))}
                </ScrollView>
              )}
            </View>
          </View>

          <Text style={[styles.deckTitle, { marginBottom: 16, marginTop: 24 }]}>Study Hubs</Text>
          <View style={styles.mainGrid}>
            {SUBJECT_LIST.map((subject: SubjectConfig) => (
              <View key={subject.id} style={[styles.subjectCard, isDesktop && styles.subjectCardDesktop, isTablet && styles.subjectCardTablet]}>
                <View style={styles.subjectCardContent}>
                  <View style={[styles.subjectIconWrap, { backgroundColor: subject.bgColor }]}>
                    <Feather name={subject.icon as any} size={24} color={subject.color} />
                  </View>
                  <Text style={styles.subjectTitle}>{subject.name}</Text>
                  <Text style={styles.subjectDesc}>{subject.description}</Text>
                </View>
                
                <View style={styles.subjectActions}>
                  <TouchableOpacity 
                    style={[styles.subjectBtn, { backgroundColor: subject.color }]}
                    onPress={() => router.push(`/chat/${subject.id}` as any)}
                  >
                    <Feather name="play" size={14} color="#FFFFFF" />
                    <Text style={styles.subjectBtnTextLight}>Start Session</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.subjectBtn, styles.subjectBtnSecondary]}
                    onPress={() => router.push(`/subject/${subject.id}` as any)}
                  >
                    <Feather name="folder" size={14} color="#4B5563" />
                    <Text style={styles.subjectBtnTextDark}>Explore & Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
    alignSelf: 'center',
    width: '100%',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 16,
    zIndex: 50,
  },
  menuButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchWrapper: {
    flex: 1,
    maxWidth: 500,
    position: 'relative',
    zIndex: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchResultsDropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 100,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultTitle: {
    fontFamily: 'Bricolage_500',
    fontSize: 15,
    color: '#111827',
  },
  searchResultSub: {
    fontFamily: 'Bricolage_400',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noResultsText: {
    padding: 24,
    fontFamily: 'Bricolage_400',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Bricolage_400',
    fontSize: 15,
    color: '#111827',
    outlineStyle: 'none' as any,
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
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
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
  decksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 40,
  },
  deckSection: {
    flex: 1,
    minWidth: 300,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deckTitle: {
    fontFamily: 'Bricolage_600',
    fontSize: 18,
    color: '#111827',
  },
  deckScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  emptyDeck: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDeckText: {
    fontFamily: 'Bricolage_400',
    color: '#9CA3AF',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    width: 240,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionModePill: {
    fontFamily: 'Bricolage_500',
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sessionCardTitle: {
    fontFamily: 'Bricolage_600',
    fontSize: 15,
    color: '#111827',
    marginBottom: 8,
    height: 40,
  },
  sessionCardDate: {
    fontFamily: 'Bricolage_400',
    fontSize: 12,
    color: '#9CA3AF',
  },
  mainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  subjectCardTablet: {
    width: 'calc(50% - 12px)' as any,
  },
  subjectCardDesktop: {
    width: 'calc(25% - 18px)' as any,
  },
  subjectCardContent: {
    padding: 24,
  },
  subjectIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  subjectTitle: {
    fontFamily: 'Bricolage_600',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  subjectDesc: {
    fontFamily: 'Bricolage_400',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  subjectActions: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 16,
    gap: 8,
  },
  subjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  subjectBtnSecondary: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subjectBtnTextLight: {
    fontFamily: 'Bricolage_500',
    fontSize: 14,
    color: '#FFFFFF',
  },
  subjectBtnTextDark: {
    fontFamily: 'Bricolage_500',
    fontSize: 14,
    color: '#4B5563',
  },
});