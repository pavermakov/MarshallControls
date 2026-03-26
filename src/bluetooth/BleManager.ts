import { BleManager, State, Device, Subscription } from 'react-native-ble-plx';

const manager = new BleManager();

export { State, Device };
export type { Subscription };
export default manager;
