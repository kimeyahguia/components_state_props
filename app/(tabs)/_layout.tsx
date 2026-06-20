import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <>
      {/* Dark icons/text on our light (#fafafa) background — keeps the
          status bar visually part of the screen instead of clashing. */}
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: { display: 'none' },
          // Matches index.tsx's `shell` background (#fafafa) so there's
          // no flash of white/default color behind the tab content
          // during transitions.
          sceneStyle: { backgroundColor: '#fafafa' },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name="house.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}