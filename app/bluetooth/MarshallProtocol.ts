import { ANCMode } from '../types';

export const MARSHALL_SERVICE_UUID = 'AA00';
export const MARSHALL_ANC_CHAR_UUID = 'AA20';

export const ANC_COMMANDS: Record<ANCMode, number> = {
    [ANCMode.Off]: 0x00,
    [ANCMode.NoiseCancelling]: 0x01,
    [ANCMode.Transparency]: 0x02
};

export const BYTE_TO_ANC_MODE: Record<number, ANCMode> = {
    0x00: ANCMode.Off,
    0x01: ANCMode.NoiseCancelling,
    0x02: ANCMode.Transparency
};

