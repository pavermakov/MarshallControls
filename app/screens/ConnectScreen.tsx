import React from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { ConnectionState, ScanStatus } from "app/types";
import { SCAN_STATUS_LABELS } from "app/bluetooth/DeviceScanner";

interface Props {                                                                                   
    connectionState: ConnectionState;                                                                 
    scanStatus: ScanStatus;                                                                           
    reconnectCount: number;                                                                           
    onConnect: () => void;
    onReset: () => void;                                                                              
}; 

const ConnectScreen = ({ connectionState, reconnectCount, scanStatus, onConnect, onReset }: Props) => {
    const isLoading = ['scanning', 'connecting', 'discovering', 'reconnecting'].includes(connectionState);
    const isReconnecting = connectionState === 'reconnecting';
    const isFailed = connectionState === 'failed';
    const scanStatusLabel = SCAN_STATUS_LABELS[scanStatus];

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.hero}>
                    <Text style={styles.brand}>MARSHALL</Text>
                    <Text style={styles.model}>Motif A.N.C.</Text>
                </View>

                <Text style={styles.status}>
                    {isReconnecting
                        ? `Reconnecting... (${reconnectCount}/5)`
                        : scanStatusLabel}
                </Text>

                {isLoading && (
                    <ActivityIndicator
                        size="large"
                        color="#F5A623"
                        style={styles.spinner}
                    />
                )}

                {!isLoading && !isFailed && (
                    <Pressable
                        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                        onPress={onConnect}
                    >
                        <Text style={styles.buttonText}>Connect Headphones</Text>
                    </Pressable>
                )}

                {isFailed && (
                    <Pressable
                        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                        onPress={onReset}
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </Pressable>
                )}

                <Text style={styles.hint}>
                    Make sure your Marshall Motif A.N.C. is turned on and nearby
                </Text>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#0d0d0d',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 48,
    },
    brand: {
        fontSize: 11,
        letterSpacing: 6,
        color: '#F5A623',
        fontWeight: '500',
        marginBottom: 4,
    },
    model: {
        fontSize: 32,
        letterSpacing: 4,
        color: '#fff',
        fontWeight: '700',
    },
    status: {
        fontSize: 13,
        color: '#F5A623',
        marginBottom: 32,
        letterSpacing: 1,
    },
    spinner: {
        marginBottom: 32,
    },
    button: {
        backgroundColor: '#F5A623',
        paddingHorizontal: 36,
        paddingVertical: 16,
        borderRadius: 8,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        color: '#111',
        fontWeight: '700',
        fontSize: 15,
    },
    hint: {
        position: 'absolute',
        bottom: 40,
        color: '#333',
        fontSize: 12,
        textAlign: 'center',
    },
});

export default ConnectScreen;
