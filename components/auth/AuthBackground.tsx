import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const AuthBackground = () => {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={[
          'rgba(74, 222, 128, 0.3)',
          'rgba(74, 222, 128, 0.1)',
          'rgba(0, 0, 0, 1)'
        ]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[
          'rgba(74, 222, 128, 0.2)',
          'transparent'
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
};
