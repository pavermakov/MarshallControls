import { Appearance } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useDeviceConnection from 'src/bluetooth/hooks/useDeviceConnection';
import ConnectScreen from 'src/screens/ConnectScreen';
import HeadphonesScreen from 'src/screens/HeadphonesScreen';

Appearance.setColorScheme('light');

const App = () => {
    const {
        device,
        connectionState,
        scanStatus,
        reconnectCount,
        connect,
        disconnect,
        reset
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
