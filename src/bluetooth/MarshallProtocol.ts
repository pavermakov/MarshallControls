// MarshallProtocol.ts

import { ANCMode } from '../types';

export { ANCMode } from '../types';

export const MARSHALL_SERVICE_UUID = 'AA00';
export const MARSHALL_ANC_CHAR_UUID = 'AA20';

export const ANC_COMMANDS: Record<ANCMode, Uint8Array> = {
  [ANCMode.Off]: new Uint8Array([0x00]),
  [ANCMode.NoiseCancelling]: new Uint8Array([0x01]),
  [ANCMode.Transparency]: new Uint8Array([0x02]),
};

// Human-readable labels for UI
export const ANC_MODE_LABELS: Record<ANCMode, string> = {
  [ANCMode.Off]: 'Off',
  [ANCMode.NoiseCancelling]: 'Noise Cancel',
  [ANCMode.Transparency]: 'Transparency',
};

// Map raw byte back to enum (for notify handler)
export const BYTE_TO_ANC_MODE: Record<number, ANCMode> = {
  0x00: ANCMode.Off,
  0x01: ANCMode.NoiseCancelling,
  0x02: ANCMode.Transparency,
};
