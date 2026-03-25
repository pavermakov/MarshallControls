import { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ANCMode } from "src/types";

interface ModeCardProps {
    mode: ANCMode;
    label: string;
    description: string;
    isActive: boolean;
    isLoading: boolean;
    onPress: (mode: ANCMode) => void;
}

const MODE_ACCENT: Record<ANCMode, string> = {
    [ANCMode.NoiseCancelling]: '#F5A623',
    [ANCMode.Transparency]: '#4FC3F7',
    [ANCMode.Off]: '#555555',
};

const ModeCard = ({ mode, label, description, isActive, isLoading, onPress }: ModeCardProps) => {
    const color = MODE_ACCENT[mode];
    const handlePress = useCallback(() => onPress(mode), [onPress, mode]);

    return (
        <Pressable
            style={[styles.modeBtn, isActive && { borderColor: color, backgroundColor: color + '12' }]}
            onPress={handlePress}
            disabled={isLoading}
        >
            {isActive && <View style={[styles.activeDot, { backgroundColor: color }]} />}
            <Text style={[styles.modeBtnLabel, isActive && { color }]}>{label}</Text>
            <Text style={styles.modeBtnDesc}>{description}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    modeBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: '#2a2a2a',
        backgroundColor: '#141414',
        alignItems: 'center',
        gap: 4,
        position: 'relative',
    },
    activeDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 5,
        height: 5,
        borderRadius: 3,
    },
    modeBtnLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    modeBtnDesc: {
        fontSize: 9,
        color: '#333',
        textAlign: 'center',
    }
});

export default ModeCard;
