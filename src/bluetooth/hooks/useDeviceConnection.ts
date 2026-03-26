import { useState, useRef, useCallback, useEffect } from 'react';
import BleManager, { Device, Subscription } from 'src/bluetooth/BleManager';
import { disconnectDevice, scanAndConnectMarshall } from 'src/bluetooth/DeviceScanner';
import useAppState from 'src/bluetooth/hooks/useAppState';
import { MARSHALL_SERVICE_UUID } from 'src/bluetooth/MarshallProtocol';
import { ConnectionState, ScanStatus, Timeout } from 'src/types';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_TRIES = 5;

const useDeviceConnection = () => {
    const [device, setDevice] = useState<Device | null>(null);
    const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [reconnectCount, setReconnectCount] = useState<number>(0);

    const isMounted = useRef<boolean>(false);
    const isReconnecting = useRef<boolean>(false);
    const reconnectTimer = useRef<Timeout>(null);
    const disconnectSub = useRef<Subscription>(null);

    useAppState(connectionState, () => {
        scheduleReconnect();
    });

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            clearReconnectTimer();
            disconnectSub.current?.remove();
        };
    }, []);

    const clearReconnectTimer = (): void => {
        if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
        }
    };

    const scheduleReconnect = (): void => {
        if (!isMounted.current) {
            return;
        }

        if (reconnectCount >= MAX_RECONNECT_TRIES) {
            setConnectionState('failed');
            isReconnecting.current = false;
            return;
        }

        clearReconnectTimer();
        reconnectTimer.current = setTimeout(
            attemptReconnect,
            RECONNECT_DELAY_MS,
        );
    };

    const attemptReconnect = async (): Promise<void> => {
        if (isReconnecting.current || !isMounted.current) {
            return;
        }

        isReconnecting.current = true;
        setReconnectCount(reconnectCount + 1);
        setConnectionState('reconnecting');

        try {
            const newDevice = await scanAndConnectMarshall(setScanStatus);
            isReconnecting.current = false;
            setDevice(newDevice);
            watchDisconnect(newDevice);
            setReconnectCount(0);
            setConnectionState('connected');
        } catch (error) {
            isReconnecting.current = false;
            scheduleReconnect();
        }
    };

    const watchDisconnect = (device: Device): void => {
        disconnectSub.current?.remove();

        disconnectSub.current = BleManager.onDeviceDisconnected(
            device.id,
            () => {
                if (!isMounted.current) {
                    return;
                }

                setDevice(null);
                isReconnecting.current = false;
                setConnectionState('reconnecting');
                scheduleReconnect();
            },
        );
    };

    const connect = useCallback(async (): Promise<void> => {
        try {
            clearReconnectTimer();
            setReconnectCount(0);
            setConnectionState('scanning');
            const device = await scanAndConnectMarshall(setScanStatus);

            if (!isMounted.current) {
                return;
            }

            setDevice(device);
            watchDisconnect(device);
            setConnectionState('connected');
        } catch (error) {
            if (!isMounted.current) {
                return;
            }

            setConnectionState('failed');
            setScanStatus('error');
        }
    }, []);

    const disconnect = useCallback(async (): Promise<void> => {
        clearReconnectTimer();
        isReconnecting.current = false;

        if (device) {
            await disconnectDevice(device);
            setDevice(null);
            setConnectionState('disconnected');
            setScanStatus('idle');
        }
    }, [device]);

    const reset = useCallback(() => {
        clearReconnectTimer();
        isReconnecting.current = false;
        setReconnectCount(0);
        setDevice(null);
        setConnectionState('disconnected');
        setScanStatus('idle');
    }, []);

    // TODO: refactor
    const listDevices = async () => {
        const connectedDevices = await BleManager.connectedDevices([
            MARSHALL_SERVICE_UUID,
        ]);
        const device: Device = connectedDevices[0];

        if (device) {
            try {
                const d = await device.connect();
                setDevice(d);
            } catch (error) {
                // handle error
            }
        }
    };

    return {
        device,
        connectionState,
        scanStatus,
        reconnectCount,
        connect,
        disconnect,
        reset,
        listDevices,
    };
};

export default useDeviceConnection;
