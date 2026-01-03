import { useRouter, usePathname } from 'expo-router';
import { Home, Activity, LayoutGrid } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { FEATURES } from '../../../../config/features';

// Pure black premium
const COLORS = {
  primary: '#29E33C',
  background: '#000000',
  inactive: '#808080',
};

/**
 * Bottom Navigation - v1.0 (Clean Minimal)
 * 3 tabs: Home | Health | Tools
 */
export const BottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/home' && (pathname === '/home' || pathname === '/')) return true;
    if (path === '/home' && pathname.includes('/workouts')) return true;
    return pathname.includes(path);
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => {
    const active = isActive(path);
    return (
      <TouchableOpacity 
        className="items-center flex-1 py-3" 
        onPress={() => router.push(path as any)}
        activeOpacity={0.7}
      >
        <Icon 
          size={24} 
          color={active ? COLORS.primary : COLORS.inactive} 
        />
        <Text
          className="text-xs mt-1"
          style={{ 
            color: active ? COLORS.primary : COLORS.inactive,
            fontWeight: active ? '600' : '400'
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-3"
      style={{ backgroundColor: COLORS.background }}
    >
      <View className="flex-row items-center justify-around">
        <NavItem path="/home" icon={Home} label="Home" />
        {FEATURES.HEALTH_TRACKING && (
          <NavItem path="/health" icon={Activity} label="Health" />
        )}
        {FEATURES.CALCULATORS && (
          <NavItem path="/calculators" icon={LayoutGrid} label="Tools" />
        )}
      </View>
    </View>
  );
};
