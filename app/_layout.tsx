import { Drawer } from 'expo-router/drawer';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer 
        screenOptions={{ 
          headerShown: true,
          drawerPosition: 'left',
          drawerActiveTintColor: '#FF8C00',
        }}
      >
        <Drawer.Screen
          name="index" 
          options={{
            drawerLabel: 'Home',
            title: 'Dashboard',
          }}
        />
        <Drawer.Screen
          name="study"
          options={{
            drawerLabel: 'Study Engine',
            title: 'Select a Subject',
          }}
        />
        <Drawer.Screen
          name="status"
          options={{
            drawerLabel: 'Status',
            title: 'My Progress',
          }}
        />
        <Drawer.Screen
          name="leaderboards"
          options={{
            drawerLabel: 'Leaderboards',
            title: 'Rankings',
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Settings',
            title: 'Account Settings',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}