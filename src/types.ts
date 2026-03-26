type ScanStatus =
    | 'idle' // Not currently scanning
    | 'checking_bluetooth' // Bluetooth is not available or permission is not granted
    | 'scanning' // Actively scanning for devices
    | 'connecting' // Attempting to connect to a device
    | 'discovering' // Discovering services and characteristics
    | 'connected' // Successfully connected and ready to interact with the device
    | 'error'; // An error occurred during scanning or connection

type ConnectionState =
    | 'disconnected'
    | 'scanning'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'failed';

enum ANCMode {
    Off = 'OFF',
    NoiseCancelling = 'NOISE_CANCELLING',
    Transparency = 'TRANSPARENCY',
}

type Timeout = ReturnType<typeof setTimeout> | null;

export type { ScanStatus, ConnectionState, Timeout };
export { ANCMode };
