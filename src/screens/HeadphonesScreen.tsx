import { useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Device } from 'src/bluetooth/BleManager';
import useANCControl from 'src/bluetooth/hooks/useANCControl';
import ModeCard from 'src/components/ModeCard';
import { MODE_ACCENT, MODE_STATUS, MODES } from 'src/constants';

interface Props {
    device: Device;
    onDisconnect: () => void;
}

const HeadphonesScreen = ({ device, onDisconnect }: Props) => {
    const { currentMode, isLoading, error, setANCMode } = useANCControl(device);
    const accent = MODE_ACCENT[currentMode];

    const handleDisconnect = useCallback(async () => {
        Alert.alert('Disconnect', 'Disconnect from Marshall Motif A.N.C.?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Disconnect',
                style: 'destructive',
                onPress: onDisconnect,
            },
        ]);
    }, [device, onDisconnect]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    <View style={styles.connRow}>
                        <View style={styles.connDot} />
                        <Text style={styles.connLabel}>Connected</Text>
                    </View>
                    <Pressable
                        onPress={handleDisconnect}
                        style={styles.discBtn}
                    >
                        <Text style={styles.discBtnText}>Disconnect</Text>
                    </Pressable>
                </View>

                {/* Device identity */}
                <View style={styles.hero}>
                    <Text style={styles.brand}>MARSHALL</Text>
                    <Text style={styles.model}>Motif A.N.C.</Text>
                    <Text style={[styles.activeMode, { color: accent }]}>
                        {MODE_STATUS[currentMode]}
                    </Text>
                </View>

                {/* ANC selector */}
                <Text style={styles.sectionLabel}>Noise Control</Text>
                <View style={styles.modeRow}>
                    {MODES.map(({ mode, label, description }) => (
                        <ModeCard
                            key={mode}
                            mode={mode}
                            label={label}
                            description={description}
                            isActive={currentMode === mode}
                            isLoading={isLoading}
                            onPress={setANCMode}
                        />
                    ))}
                </View>

                {isLoading && (
                    <ActivityIndicator color="#F5A623" style={styles.spinner} />
                )}
                {error && !isLoading && (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                <Text style={styles.hint}>
                    Physical button presses sync automatically
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
        paddingHorizontal: 24,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        marginBottom: 40,
    },
    connRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    connDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    connLabel: {
        fontSize: 12,
        color: '#888',
        letterSpacing: 0.5,
    },
    discBtn: {
        borderWidth: 0.5,
        borderColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 5,
    },
    discBtnText: {
        fontSize: 11,
        color: '#666',
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
        fontSize: 28,
        letterSpacing: 4,
        color: '#fff',
        fontWeight: '700',
        marginBottom: 10,
    },
    activeMode: {
        fontSize: 12,
        letterSpacing: 1,
    },
    sectionLabel: {
        fontSize: 10,
        letterSpacing: 3,
        color: '#444',
        textTransform: 'uppercase',
        marginBottom: 14,
    },
    modeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
    },
    spinner: {
        marginTop: 8,
    },
    errorText: {
        color: '#E24B4A',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    hint: {
        position: 'absolute',
        bottom: 32,
        alignSelf: 'center',
        fontSize: 11,
        color: '#2a2a2a',
        letterSpacing: 0.3,
    },
});

export default HeadphonesScreen;
