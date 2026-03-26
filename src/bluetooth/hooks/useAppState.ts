import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { ConnectionState } from 'src/types';

const useAppState = (
    connectionState: ConnectionState,
    onRestart: () => void,
) => {
    useEffect(() => {
        const subscription = AppState.addEventListener(
            'change',
            (state: AppStateStatus) => {
                if (state === 'active' && connectionState === 'reconnecting') {
                    onRestart();
                }
            },
        );

        return () => {
            subscription.remove();
        };
    }, [connectionState]);
};

export default useAppState;
