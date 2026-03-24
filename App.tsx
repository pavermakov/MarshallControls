// App.tsx

import React from 'react';
import { useDeviceConnection } from './src/bluetooth/hooks/useDeviceConnection';
import { ConnectScreen } from './src/screens/ConnectScreen';
import { HeadphonesScreen } from './src/screens/HeadphonesScreen';

const App = () => {
  const {
    device,
    connectionState,
    scanStatus,
    reconnectCount,
    connect,
    disconnect,
    reset,
  } = useDeviceConnection();

  if (connectionState === 'connected' && device) {
    return (
      <HeadphonesScreen
        device={device}
        onDisconnect={disconnect}
      />
    );
  }

  return (
    <ConnectScreen
      onConnect={connect}
      connectionState={connectionState}
      scanStatus={scanStatus}
      reconnectCount={reconnectCount}
      onReset={reset}
    />
  );
};

export default App;
