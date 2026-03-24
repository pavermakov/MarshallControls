export type ScanStatus =
  | 'idle'
  | 'checking_bluetooth'
  | 'scanning'
  | 'connecting'
  | 'discovering'
  | 'connected'
  | 'error';

export type ConnectionState =
  | 'disconnected'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

export enum ANCMode {
  Off = 'OFF',
  NoiseCancelling = 'ANC',
  Transparency = 'TRANSPARENCY',
}
