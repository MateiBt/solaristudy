import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  useFonts
} from '@expo-google-fonts/bricolage-grotesque';
import { Drawer } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Bricolage_400: BricolageGrotesque_400Regular,
    Bricolage_500: BricolageGrotesque_500Medium,
    Bricolage_600: BricolageGrotesque_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer 
        screenOptions={{ 
          headerShown: true,
          drawerPosition: 'left',
          drawerActiveTintColor: '#222222',
          headerTitleStyle: {
            fontFamily: 'Bricolage_600',
          },
          drawerLabelStyle: {
            fontFamily: 'Bricolage_500',
          },
        }}
      >
        <Drawer.Screen name="index" options={{ drawerLabel: 'Home', title: 'Dashboard' }} />
        <Drawer.Screen name="study" options={{ drawerLabel: 'Study Engine', title: 'Select a Subject' }} />
        <Drawer.Screen name="status" options={{ drawerLabel: 'Status', title: 'My Progress' }} />
        <Drawer.Screen name="leaderboards" options={{ drawerLabel: 'Leaderboards', title: 'Rankings' }} />
        <Drawer.Screen name="settings" options={{ drawerLabel: 'Settings', title: 'Account Settings' }} />
        <Drawer.Screen name="chat/[id]" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
        <Drawer.Screen name="login" options={{ drawerItemStyle: { display: 'none' }, headerShown: false, swipeEnabled: false }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}