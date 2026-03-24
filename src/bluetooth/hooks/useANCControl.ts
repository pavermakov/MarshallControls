import { useCallback, useEffect, useState } from 'react';
import { Device } from 'react-native-ble-plx';
// @ts-ignore — no type declarations for base-64
import { encode as btoa, decode as atob } from 'base-64';
import { ANCMode } from '../../types';
import { ANC_COMMANDS, BYTE_TO_ANC_MODE, MARSHALL_ANC_CHAR_UUID, MARSHALL_SERVICE_UUID } from '../MarshallProtocol';

export function useANCControl(device: Device | null) {
  const [currentMode, setCurrentMode] = useState<ANCMode>(ANCMode.Off);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to notify — stays in sync with physical button presses
  useEffect(() => {
    if (!device) return;

    const subscription = device.monitorCharacteristicForService(
      MARSHALL_SERVICE_UUID,
      MARSHALL_ANC_CHAR_UUID,
      (err, characteristic) => {
        if (err || !characteristic?.value) return;
        const byte = atob(characteristic.value).charCodeAt(0);
        const mode = BYTE_TO_ANC_MODE[byte];
        if (mode !== undefined) setCurrentMode(mode);
      }
    );

    return () => subscription.remove();
  }, [device]);

  const setANCMode = useCallback(async (mode: ANCMode) => {
    if (!device) return;
    setIsLoading(true);
    setError(null);
    try {
      const bytes = ANC_COMMANDS[mode];
      const encoded = btoa(String.fromCharCode(...bytes));
      await device.writeCharacteristicWithResponseForService(
        MARSHALL_SERVICE_UUID,
        MARSHALL_ANC_CHAR_UUID,
        encoded
      );
      setCurrentMode(mode);
    } catch (e: any) {
      setError('Failed to set ANC mode. Are headphones connected?');
    } finally {
      setIsLoading(false);
    }
  }, [device]);

  return { currentMode, setANCMode, isLoading, error };
}
