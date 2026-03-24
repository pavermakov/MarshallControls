// src/bluetooth/DeviceScanner.ts

import { BleManager, Device, State } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { ScanStatus } from '../types';

export type { ScanStatus } from '../types';

let _manager: BleManager | null = null;
function getManager(): BleManager {
  if (!_manager) _manager = new BleManager();
  return _manager;
}

const MARSHALL_DEVICE_NAME = 'MOTIF A.N.C.';

export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
  idle: 'Ready to connect',
  checking_bluetooth: 'Checking Bluetooth...',
  scanning: 'Scanning for Marshall...',
  connecting: 'Connecting...',
  discovering: 'Setting up...',
  connected: 'Connected',
  error: 'Something went wrong',
};

export async function requestBLEPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') return true;

  if (Number(Platform.Version) >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(results).every(
      r => r === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function waitForBLEPoweredOn(): Promise<void> {
  return new Promise((resolve, reject) => {
    const subscription = getManager().onStateChange(state => {
      if (state === State.PoweredOn) {
        clearTimeout(timeout);
        subscription.remove();
        resolve();
      }
    }, true);
    const timeout = setTimeout(() => {
      subscription.remove();
      reject(new Error('Bluetooth did not turn on'));
    }, 10000);
  });
}

export async function scanAndConnectMarshall(
  onStatusChange?: (status: ScanStatus) => void
): Promise<Device> {
  const hasPermission = await requestBLEPermissions();
  if (!hasPermission) throw new Error('Bluetooth permissions denied');

  onStatusChange?.('checking_bluetooth');
  await waitForBLEPoweredOn();

  return new Promise((resolve, reject) => {
    onStatusChange?.('scanning');

    const timeout = setTimeout(() => {
      getManager().stopDeviceScan();
      reject(new Error('Marshall headphones not found. Make sure they are on and nearby.'));
    }, 15000);

    getManager().startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
      if (error) {
        clearTimeout(timeout);
        reject(error);
        return;
      }

      if (!device?.name?.includes(MARSHALL_DEVICE_NAME)) return;

      getManager().stopDeviceScan();
      clearTimeout(timeout);

      try {
        onStatusChange?.('connecting');
        const connected = await device.connect();

        onStatusChange?.('discovering');
        await connected.discoverAllServicesAndCharacteristics();

        onStatusChange?.('connected');
        resolve(connected);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export async function disconnectDevice(device: Device): Promise<void> {
  const isConnected = await device.isConnected();
  if (isConnected) await device.cancelConnection();
}

export { getManager as manager };
