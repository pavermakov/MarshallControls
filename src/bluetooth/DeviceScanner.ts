import { Platform, PermissionsAndroid, PermissionStatus } from 'react-native';
import { ScanStatus } from 'src/types';
import PlatformExt from 'src/extensions/PlatformExt';
import BleManager, { State, Device } from 'src/bluetooth/BleManager';

const MARSHALL_DEVICE_NAME = 'MOTIF A.N.C.';

const requestBLEPermissions = async (): Promise<boolean> => {
    if (PlatformExt.isIos) {
        return true;
    }

    if (
        PlatformExt.isAndroid &&
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ) {
        const apiLevel: number = parseInt(Platform.Version.toString(), 10);

        if (apiLevel < 31) {
            const granted: PermissionStatus = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        ) {
            const result: Record<string, PermissionStatus> =
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);

            const scanGranted: boolean =
                result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
                PermissionsAndroid.RESULTS.GRANTED;
            const connectGranted: boolean =
                result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
                PermissionsAndroid.RESULTS.GRANTED;
            const locationGranted: boolean =
                result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
                PermissionsAndroid.RESULTS.GRANTED;

            return scanGranted && connectGranted && locationGranted;
        }
    }

    // handle case where permissions are not defined (older Android versions or permissions not granted)

    return false;
};

const waitForBLEPoweredOn = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const subscription = BleManager.onStateChange(state => {
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
};

export const scanAndConnectMarshall = async (
    onStatusChange: (status: ScanStatus) => void,
): Promise<Device> => {
    const hasPermission: boolean = await requestBLEPermissions();

    if (!hasPermission) {
        throw new Error('Bluetooth permissions denied');
    }

    onStatusChange('checking_bluetooth');
    await waitForBLEPoweredOn();

    return new Promise((resolve, reject) => {
        onStatusChange('scanning');

        const timeout = setTimeout(() => {
            BleManager.stopDeviceScan();
            reject(
                new Error(
                    'Marshall headphones not found. Make sure they are on and nearby.',
                ),
            );
        }, 15000);

        BleManager.startDeviceScan(
            null,
            { allowDuplicates: false },
            async (error, device) => {
                if (error) {
                    clearTimeout(timeout);
                    reject(error);
                    return;
                }

                if (!device?.name?.includes(MARSHALL_DEVICE_NAME)) {
                    return;
                }

                BleManager.stopDeviceScan();
                clearTimeout(timeout);

                try {
                    onStatusChange('connecting');
                    const connectedDevice: Device = await device.connect();

                    onStatusChange('discovering');
                    await connectedDevice.discoverAllServicesAndCharacteristics();

                    onStatusChange('connected');
                    resolve(connectedDevice);
                } catch (error) {
                    reject(error);
                }
            },
        );
    });
};

export const disconnectDevice = async (device: Device): Promise<void> => {
    const isConnected: boolean = await device.isConnected();

    if (isConnected) {
        await device.cancelConnection();
    }
};
