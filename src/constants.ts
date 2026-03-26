import { ANCMode, ScanStatus } from "./types";

export const MODE_ACCENT: Record<ANCMode, string> = {
    [ANCMode.NoiseCancelling]: '#F5A623',
    [ANCMode.Transparency]: '#4FC3F7',
    [ANCMode.Off]: '#555555',
};

export const MODE_STATUS: Record<ANCMode, string> = {
    [ANCMode.NoiseCancelling]: 'Noise Cancellation Active',
    [ANCMode.Transparency]: 'Transparency Active',
    [ANCMode.Off]: 'Noise Control Off',
};

export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
    idle: 'Ready to connect',
    checking_bluetooth: 'Checking Bluetooth...',
    scanning: 'Scanning for Marshall...',
    connecting: 'Connecting...',
    discovering: 'Setting up...',
    connected: 'Connected',
    error: 'Something went wrong',
};

interface MODE {
    mode: ANCMode;
    label: string;
    description: string;
}

export const MODES: MODE[] = [
    {
        mode: ANCMode.NoiseCancelling,
        label: 'Noise Cancel',
        description: 'Ambient sound blocked',
    },
    {
        mode: ANCMode.Transparency,
        label: 'Transparency',
        description: 'Hear the world around you',
    },
    {
        mode: ANCMode.Off,
        label: 'Off',
        description: 'Standard audio mode'
    },
];