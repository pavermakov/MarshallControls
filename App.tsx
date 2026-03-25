import { Appearance } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useDeviceConnection from 'app/bluetooth/hooks/useDeviceConnection';
import ConnectScreen from 'app/screens/ConnectScreen';
import HeadphonesScreen from 'app/screens/HeadphonesScreen';

Appearance.setColorScheme('light');

const App = () => {
    const {
        device,
        connectionState,
        scanStatus,
        reconnectCount,
        connect,
        disconnect,
        reset,
        listDevices
    } = useDeviceConnection();

    return (
        <SafeAreaProvider>
            {connectionState === 'connected' && device != null
                ?
                    <HeadphonesScreen
                        device={device}
                        onDisconnect={disconnect}
                    />
                :
                    <ConnectScreen
                        connectionState={connectionState}
                        reconnectCount={reconnectCount}
                        scanStatus={scanStatus}
                        onConnect={connect}
                        onReset={reset}
                    />
            }
        </SafeAreaProvider>
    );
};

export default App;
