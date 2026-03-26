import { useCallback, useEffect, useState } from 'react';
import { encode, decode } from 'base-64';
import { Device } from 'src/bluetooth/BleManager';
import { ANCMode } from 'src/types';
import {
    ANC_COMMANDS,
    BYTE_TO_ANC_MODE,
    MARSHALL_SERVICE_UUID,
    MARSHALL_ANC_CHAR_UUID,
} from 'src/bluetooth/MarshallProtocol';

const useANCControl = (device: Device | null) => {
    const [currentMode, setCurrentMode] = useState<ANCMode>(ANCMode.Off);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!device) {
            return;
        }

        const subscription = device.monitorCharacteristicForService(
            MARSHALL_SERVICE_UUID,
            MARSHALL_ANC_CHAR_UUID,
            (error, characteristic) => {
                if (error || !characteristic?.value) {
                    return;
                }

                const byte: number = decode(characteristic.value).charCodeAt(0);
                const mode: ANCMode = BYTE_TO_ANC_MODE[byte];

                if (mode !== undefined) {
                    setCurrentMode(mode);
                }
            },
        );

        return () => {
            subscription.remove();
        };
    }, [device]);

    const setANCMode = useCallback(
        async (mode: ANCMode): Promise<void> => {
            if (!device) {
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const bytes: number = ANC_COMMANDS[mode];
                const encoded: string = encode(String.fromCharCode(bytes));

                await device.writeCharacteristicWithResponseForService(
                    MARSHALL_SERVICE_UUID,
                    MARSHALL_ANC_CHAR_UUID,
                    encoded,
                );

                setCurrentMode(mode);
            } catch (error: any) {
                setError(
                    'Failed to set ANC mode. Are your headphones connected?',
                );
            } finally {
                setIsLoading(false);
            }
        },
        [device],
    );

    return { currentMode, isLoading, error, setANCMode };
};

export default useANCControl;
