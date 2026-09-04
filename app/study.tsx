import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function StudyEngine() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  
  const isLargeScreen = width > 900;

  const subjects = [
    { 
      id: 'math', 
      name: 'Mathematics', 
      icon: 'pie-chart',
      color: '#FF4D4D',
      bgColor: '#FFE8E8',
      stats: { hours: '14.5h', chats: 8, folders: 3, score: '92%' },
      intro: "Let's get past just finding the right answer. When you study Math with SolariStudy, we want to make sure your reasoning is rock solid from start to finish.",
      bullets: [
        "Tearing down proofs: We read through your proofs line by line.",
        "Checking for completeness: We'll tell you if your solution is fully baked.",
        "Spotting the gaps: Catching logic jumps and finding what's missing.",
        "Unstucking the hard stuff: Breaking complex calculus into human steps."
      ]
    },
    { 
      id: 'physics', 
      name: 'Physics', 
      icon: 'aperture',
      color: '#9B51E0',
      bgColor: '#F0E6FF',
      stats: { hours: '9.2h', chats: 5, folders: 2, score: '88%' },
      intro: "Physics isn't just about plugging numbers into a formula; it's about understanding how the universe actually moves.",
      bullets: [
        "Setting up the problem: Figuring out which physical laws apply first.",
        "Derivation breakdowns: Walking you through brutal formula derivations.",
        "Visualizing the invisible: Mapping magnetic fields and thermodynamic cycles.",
        "Sanity-checking your answers: Finding the dropped negative signs."
      ]
    },
    { 
      id: 'astronomy', 
      name: 'Astronomy', 
      icon: 'moon',
      color: '#2D9CDB',
      bgColor: '#E6F4FE',
      stats: { hours: '4.1h', chats: 3, folders: 1, score: null },
      intro: "Space is overwhelmingly big, and the math used to describe it can be just as intimidating. We bring the cosmos down to earth:",
      bullets: [
        "Decoding orbital mechanics: Breaking down trajectories and planetary motion.",
        "Making sense of scale: Conceptualizing massive distances and energy outputs.",
        "Connecting physics to the stars: Applying Earth physics to black holes.",
        "Analyzing the data: Interpreting light curves to spectroscopic shifts."
      ]
    },
    { 
      id: 'linguistics', 
      name: 'Linguistics', 
      icon: 'message-circle',
      color: '#F2994A',
      bgColor: '#FFF3E0',
      stats: { hours: '6.8h', chats: 6, folders: 4, score: null },
      intro: "Language is messy, but there is a deep structure underneath it all. We help you tear it apart and see how the gears turn:",
      bullets: [
        "Drawing the trees: Building complex syntax trees without getting lost.",
        "Finding the patterns: Spotting hidden rules in phonology and morphology.",
        "Tracking the evolution: Breaking down how languages evolve over time.",
        "Testing your hypotheses: Sanity-checking theories about grammar rules."
      ]
    },
    { 
      id: 'general', 
      name: 'General Tutor', 
      icon: 'cpu',
      color: '#27AE60',
      bgColor: '#E8F5E9',
      stats: { hours: '12.0h', chats: 15, folders: 5, score: null },
      intro: "Got a syllabus that doesn't fit into a neat box? We adapt to whatever you throw at us:",
      bullets: [
        "Decoding your syllabus: Upload outlines to see what you actually need.",
        "Building a roadmap: Chopping massive topics into a step-by-step plan.",
        "Connecting the dots: Seeing how different concepts relate to each other.",
        "Custom practice: Generating highly specific practice scenarios."
      ]
    },
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
            placeholder="Search subjects..."
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
        <View>
          <Text style={styles.header}>Study Dashboard</Text>
          <Text style={styles.subtitle}>Your active learning environments</Text>
        </View>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>Total Study Time: 46.6h</Text>
        </View>
      </View>
      
      {}
      <View style={[styles.gridContainer, isLargeScreen && styles.gridContainerWide]}>
        {subjects.map((subject) => (
          <View key={subject.id} style={[styles.card, isLargeScreen && styles.cardWide]}>
            
            {}
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: subject.bgColor }]}>
                <Feather name={subject.icon as any} size={24} color={subject.color} />
              </View>
              <Text style={styles.cardTitle}>{subject.name}</Text>
            </View>

            {}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Feather name="clock" size={14} color="#6B7280" />
                <Text style={styles.statText}>{subject.stats.hours}</Text>
              </View>
              <View style={styles.statBox}>
                <Feather name="message-square" size={14} color="#6B7280" />
                <Text style={styles.statText}>{subject.stats.chats} Chats</Text>
              </View>
              <View style={styles.statBox}>
                <Feather name="folder" size={14} color="#6B7280" />
                <Text style={styles.statText}>{subject.stats.folders} Folders</Text>
              </View>
              {subject.stats.score && (
                <View style={[styles.statBox, { backgroundColor: subject.bgColor, borderColor: subject.bgColor }]}>
                  <Feather name="target" size={14} color={subject.color} />
                  <Text style={[styles.statText, { color: subject.color, fontFamily: 'Bricolage_600' }]}>
                    Avg: {subject.stats.score}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {}
            <Text style={styles.introText}>{subject.intro}</Text>
            <View style={styles.bulletsContainer}>
              {subject.bullets.map((bullet, index) => (
                <View key={index} style={styles.bulletRow}>
                  <Text style={[styles.bulletDot, { color: subject.color }]}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>

            {}
            <View style={styles.cardFooter}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: subject.color }]}
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: subject.id } })}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>Launch Engine</Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
          </View>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    flexWrap: 'wrap',
    gap: 16
  },
  header: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 32, 
    color: '#111827', 
    letterSpacing: -0.5, 
    marginBottom: 4
  },
  subtitle: {
    fontFamily: 'Bricolage_400', 
    fontSize: 16, 
    color: '#6B7280', 
  },
  pillBadge: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  pillText: {
    fontFamily: 'Bricolage_600',
    fontSize: 14,
    color: '#374151',
  },
  gridContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  gridContainerWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    width: '100%',
  },
  cardWide: {
    flex: 1,
    minWidth: 450, 
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  cardTitle: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 24, 
    color: '#111827',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statText: {
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#4B5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 24,
  },
  introText: {
    fontFamily: 'Bricolage_500', 
    fontSize: 15, 
    color: '#374151', 
    lineHeight: 24,
    marginBottom: 16
  },
  bulletsContainer: {
    gap: 12,
    marginBottom: 32,
    flex: 1, 
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontFamily: 'Bricolage_600',
    fontSize: 18,
    marginRight: 12,
    lineHeight: 22,
  },
  bulletText: {
    fontFamily: 'Bricolage_400',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    flex: 1,
  },
  cardFooter: {
    marginTop: 'auto', 
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'Bricolage_600',
    color: '#FFFFFF',
    fontSize: 16,
  }
});