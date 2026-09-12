// src/components/GradientButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#A78BFA',
};

const RADIUS = { pill: 24 };
const SPACING = { sm: 14, lg: 24 };

export const GradientButton = ({ onPress, disabled, loading, children, style, gradientColors }) => {
  const colors = gradientColors || [COLORS.primary, COLORS.primaryLight];
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={[styles.wrapper, style]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.text}>{children}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  gradient: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0.5,
  },
});
