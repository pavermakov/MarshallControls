// src/screens/HeadphonesScreen.tsx

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Device } from 'react-native-ble-plx';
import { useANCControl } from '../bluetooth/hooks/useANCControl';
import { ANCMode } from '../types';
import { disconnectDevice } from '../bluetooth/DeviceScanner';

interface Props {
  device: Device;
  onDisconnect: () => void;
}

const MODES: { mode: ANCMode; label: string; description: string }[] = [
  { mode: ANCMode.NoiseCancelling, label: 'Noise Cancel', description: 'Ambient sound blocked' },
  { mode: ANCMode.Transparency, label: 'Transparency', description: 'Hear the world around you' },
  { mode: ANCMode.Off, label: 'Off', description: 'Standard audio mode' },
];

const MODE_ACCENT: Record<ANCMode, string> = {
  [ANCMode.NoiseCancelling]: '#F5A623',
  [ANCMode.Transparency]: '#4FC3F7',
  [ANCMode.Off]: '#555555',
};

const MODE_STATUS: Record<ANCMode, string> = {
  [ANCMode.NoiseCancelling]: 'Noise Cancellation Active',
  [ANCMode.Transparency]: 'Transparency Active',
  [ANCMode.Off]: 'Noise Control Off',
};

interface ModeCardProps {
  mode: ANCMode;
  label: string;
  description: string;
  isActive: boolean;
  isLoading: boolean;
  onPress: (mode: ANCMode) => void;
}

const ModeCard = memo(({ mode, label, description, isActive, isLoading, onPress }: ModeCardProps) => {
  const color = MODE_ACCENT[mode];
  const handlePress = useCallback(() => onPress(mode), [onPress, mode]);
  return (
    <Pressable
      style={[styles.modeBtn, isActive && { borderColor: color, backgroundColor: color + '12' }]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isActive && <View style={[styles.activeDot, { backgroundColor: color }]} />}
      <Text style={[styles.modeBtnLabel, isActive && { color }]}>{label}</Text>
      <Text style={styles.modeBtnDesc}>{description}</Text>
    </Pressable>
  );
});

export const HeadphonesScreen = ({ device, onDisconnect }: Props) => {
  const { currentMode, setANCMode, isLoading, error } = useANCControl(device);

  const handleDisconnect = useCallback(async () => {
    Alert.alert('Disconnect', 'Disconnect from Marshall Motif A.N.C.?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect', style: 'destructive',
        onPress: async () => {
          await disconnectDevice(device);
          onDisconnect();
        },
      },
    ]);
  }, [device, onDisconnect]);

  const accent = MODE_ACCENT[currentMode];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.connRow}>
            <View style={styles.connDot} />
            <Text style={styles.connLabel}>Connected</Text>
          </View>
          <Pressable onPress={handleDisconnect} style={styles.discBtn}>
            <Text style={styles.discBtnText}>Disconnect</Text>
          </Pressable>
        </View>

        {/* Device identity */}
        <View style={styles.hero}>
          <Text style={styles.brand}>MARSHALL</Text>
          <Text style={styles.model}>Motif A.N.C.</Text>
          <Text style={[styles.activeMode, { color: accent }]}>
            {MODE_STATUS[currentMode]}
          </Text>
        </View>

        {/* ANC selector */}
        <Text style={styles.sectionLabel}>Noise Control</Text>
        <View style={styles.modeRow}>
          {MODES.map(({ mode, label, description }) => (
            <ModeCard
              key={mode}
              mode={mode}
              label={label}
              description={description}
              isActive={currentMode === mode}
              isLoading={isLoading}
              onPress={setANCMode}
            />
          ))}
        </View>

        {isLoading && (
          <ActivityIndicator color="#F5A623" style={styles.spinner} />
        )}
        {error && !isLoading && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <Text style={styles.hint}>Physical button presses sync automatically</Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 40,
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  connLabel: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 0.5,
  },
  discBtn: {
    borderWidth: 0.5,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  discBtnText: {
    fontSize: 11,
    color: '#666',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brand: {
    fontSize: 11,
    letterSpacing: 6,
    color: '#F5A623',
    fontWeight: '500',
    marginBottom: 4,
  },
  model: {
    fontSize: 28,
    letterSpacing: 4,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 10,
  },
  activeMode: {
    fontSize: 12,
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#444',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  modeBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#2a2a2a',
    backgroundColor: '#141414',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  modeBtnLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  modeBtnDesc: {
    fontSize: 9,
    color: '#333',
    textAlign: 'center',
  },
  spinner: {
    marginTop: 8,
  },
  errorText: {
    color: '#E24B4A',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  hint: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    fontSize: 11,
    color: '#2a2a2a',
    letterSpacing: 0.3,
  },
});
