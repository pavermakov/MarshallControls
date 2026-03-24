// src/bluetooth/hooks/useDeviceConnection.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Device, State } from 'react-native-ble-plx';
import { manager, scanAndConnectMarshall } from '../DeviceScanner';
import { ScanStatus, ConnectionState } from '../../types';

export type { ConnectionState } from '../../types';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_TRIES = 5;

interface UseDeviceConnectionResult {
  device: Device | null;
  connectionState: ConnectionState;
  scanStatus: ScanStatus;
  reconnectCount: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reset: () => void;
}

export function useDeviceConnection(): UseDeviceConnectionResult {
  const [device, setDevice] = useState<Device | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [reconnectCount, setReconnectCount] = useState(0);

  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempt = useRef(0);
  const isMounted = useRef(true);
  const isReconnecting = useRef(false);
  const disconnectSub = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearReconnectTimer();
      disconnectSub.current?.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && connectionState === 'reconnecting') {
        scheduleReconnect();
      }
    });
    return () => subscription.remove();
  }, [connectionState]);

  function clearReconnectTimer() {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }

  function scheduleReconnect() {
    if (!isMounted.current) return;
    if (reconnectAttempt.current >= MAX_RECONNECT_TRIES) {
      setConnectionState('failed');
      isReconnecting.current = false;
      return;
    }
    clearReconnectTimer();
    reconnectTimer.current = setTimeout(() => attemptReconnect(), RECONNECT_DELAY_MS);
  }

  async function attemptReconnect() {
    if (!isMounted.current || isReconnecting.current) return;

    isReconnecting.current = true;
    reconnectAttempt.current += 1;
    setReconnectCount(reconnectAttempt.current);
    setConnectionState('reconnecting');

    try {
      const bleState = await manager().state();
      if (bleState !== State.PoweredOn) {
        scheduleReconnect();
        return;
      }

      const connected = await scanAndConnectMarshall(setScanStatus);
      if (!isMounted.current) return;

      reconnectAttempt.current = 0;
      setReconnectCount(0);
      setDevice(connected);
      setConnectionState('connected');
      isReconnecting.current = false;
      watchDisconnect(connected);
    } catch {
      isReconnecting.current = false;
      scheduleReconnect();
    }
  }

  function watchDisconnect(connectedDevice: Device) {
    disconnectSub.current?.remove();
    disconnectSub.current = manager().onDeviceDisconnected(connectedDevice.id, () => {
      if (!isMounted.current) return;
      setDevice(null);
      setConnectionState('reconnecting');
      reconnectAttempt.current = 0;
      isReconnecting.current = false;
      scheduleReconnect();
    });
  }

  const connect = useCallback(async () => {
    clearReconnectTimer();
    reconnectAttempt.current = 0;
    setReconnectCount(0);
    setConnectionState('scanning');

    try {
      const connected = await scanAndConnectMarshall(setScanStatus);
      if (!isMounted.current) return;
      setDevice(connected);
      setConnectionState('connected');
      watchDisconnect(connected);
    } catch (error) {
      if (!isMounted.current) return;
      setScanStatus('error');
      console.log(error);
      setConnectionState('failed');
    }
  }, []);

  const disconnect = useCallback(async () => {
    clearReconnectTimer();
    isReconnecting.current = false;
    reconnectAttempt.current = MAX_RECONNECT_TRIES;

    if (device) {
      const isConnected = await device.isConnected();
      if (isConnected) await device.cancelConnection();
    }

    setDevice(null);
    setConnectionState('disconnected');
    setScanStatus('idle');
  }, [device]);

  const reset = useCallback(() => {
    clearReconnectTimer();
    isReconnecting.current = false;
    reconnectAttempt.current = 0;
    setReconnectCount(0);
    setDevice(null);
    setConnectionState('disconnected');
    setScanStatus('idle');
  }, []);

  return { device, connectionState, scanStatus, reconnectCount, connect, disconnect, reset };
}
