import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  useFonts
} from '@expo-google-fonts/bricolage-grotesque';
import { Feather } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { User } from '@supabase/supabase-js';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getDashboardMetrics, getUserProfile } from '../lib/db';
import { SUBJECT_LIST } from '../lib/subjects';
import { supabase } from '../lib/supabase';

SplashScreen.preventAutoHideAsync();

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const user = props.user as User | null;

  const userEmail = user?.email || 'Guest';
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0] || 'User';

  const [streak, setStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    async function loadDrawerData() {
      if (!user) return;
      try {
        const [profile, metrics] = await Promise.all([
          getUserProfile(),
          getDashboardMetrics()
        ]);
        if (profile) setStreak(profile.streak_count);
        if (metrics) setAccuracy(metrics.globalAccuracy);
      } catch (error) {
        console.error(error);
      }
    }
    loadDrawerData();
  }, [pathname, user]);

  const NavItem = ({ icon, label, route, badge, activeColor = '#FFFFFF' }: { icon: string, label: string, route: string, badge?: string, activeColor?: string }) => {
    const isActive = pathname === route || (route === '/' && pathname === '/index');
    
    return (
      <TouchableOpacity 
        style={[styles.navItem, isActive && styles.navItemActive]}
        onPress={() => router.push(route as any)}
        activeOpacity={0.7}
      >
        <Feather name={icon as any} size={20} color={isActive ? activeColor : '#A1A1AA'} />
        <Text style={[styles.navLabel, isActive && { color: activeColor, fontFamily: 'Bricolage_600' }]}>{label}</Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
        
        <View style={styles.brandHeader}>
          <View style={styles.brandLogo}>
            <Feather name="hexagon" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.brandText}>SolariStudy</Text>
          <View style={{ flex: 1 }} />
          <Feather name="search" size={18} color="#A1A1AA" />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Feather name="zap" size={14} color="#F59E0B" />
            <Text style={styles.statText}>{streak} Day Streak</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Feather name="target" size={14} color="#10B981" />
            <Text style={[styles.statText, { color: '#10B981' }]}>{accuracy}% Accuracy</Text>
          </View>
        </View>

        <View style={styles.navSection}>
          <NavItem icon="home" label="Home" route="/" />
          <NavItem icon="cpu" label="Study Engine" route="/study" badge="4" />
          <NavItem icon="bar-chart-2" label="My Progress" route="/status" />
          <NavItem icon="award" label="Leaderboards" route="/leaderboards" badge="12" />
        </View>

        <View style={styles.divider} />

        <View style={styles.navSection}>
          <Text style={styles.sectionTitle}>EXPLORE SUBJECTS</Text>
          {SUBJECT_LIST.map((subject) => (
            <NavItem 
              key={subject.id} 
              icon={subject.icon} 
              label={subject.name} 
              route={`/subject/${subject.id}`} 
              activeColor={subject.color} 
            />
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.footerSection}>
          <NavItem icon="life-buoy" label="Support" route="/support" />
          <NavItem icon="settings" label="Settings" route="/settings" />
          
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Feather name="user" size={18} color="#FFFFFF" />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName} numberOfLines={1}>{userName}</Text>
              <Text style={styles.profileEmail} numberOfLines={1}>{userEmail}</Text>
            </View>
            <TouchableOpacity onPress={() => supabase.auth.signOut()} style={{ padding: 4 }}>
              <Feather name="log-out" size={16} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
        </View>

      </DrawerContentScrollView>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Bricolage_400: BricolageGrotesque_400Regular,
    Bricolage_500: BricolageGrotesque_500Medium,
    Bricolage_600: BricolageGrotesque_600SemiBold,
  });

  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authInitialized) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, authInitialized, segments]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;
  if (!authInitialized) return null; 

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer 
        drawerContent={(props) => <CustomDrawerContent {...props} user={user} />}
        screenOptions={{ 
          headerShown: false, 
          drawerStyle: {
            backgroundColor: '#18181B',
            width: 280,
            borderRightWidth: 1,
            borderRightColor: '#27272A',
          },
        }}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="study" />
        <Drawer.Screen name="subject/[id]" />
        <Drawer.Screen name="status" />
        <Drawer.Screen name="leaderboards" />
        <Drawer.Screen name="settings" />
        <Drawer.Screen name="chat/[id]" />
        <Drawer.Screen name="login" options={{ swipeEnabled: false }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: '#18181B' },
  scrollContent: { flex: 1, paddingTop: 24 },
  brandHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  brandLogo: { marginRight: 12 },
  brandText: { fontFamily: 'Bricolage_600', fontSize: 18, color: '#FFFFFF', letterSpacing: -0.3 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 32, gap: 8 },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)', gap: 6 },
  statText: { fontFamily: 'Bricolage_500', fontSize: 12, color: '#F59E0B' },
  sectionTitle: { fontFamily: 'Bricolage_600', fontSize: 11, color: '#71717A', letterSpacing: 1, marginBottom: 8, marginTop: 8, paddingHorizontal: 12 },
  navSection: { paddingHorizontal: 12, gap: 4 },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  navItemActive: { backgroundColor: '#27272A' },
  navLabel: { fontFamily: 'Bricolage_500', fontSize: 15, color: '#A1A1AA', marginLeft: 12, flex: 1 },
  badge: { backgroundColor: '#27272A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontFamily: 'Bricolage_500', fontSize: 12, color: '#D4D4D8' },
  divider: { height: 1, backgroundColor: '#27272A', marginVertical: 16, marginHorizontal: 20 },
  footerSection: { paddingHorizontal: 12, paddingBottom: 24, gap: 4 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#27272A', padding: 12, borderRadius: 12, marginTop: 16 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3F3F46', justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  onlineDot: { position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#27272A' },
  profileTextContainer: { flex: 1, paddingRight: 8 },
  profileName: { fontFamily: 'Bricolage_600', fontSize: 14, color: '#FFFFFF' },
  profileEmail: { fontFamily: 'Bricolage_400', fontSize: 12, color: '#A1A1AA' },
});