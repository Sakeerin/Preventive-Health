import {
    TouchableOpacity,
    Text,
    StyleSheet,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    title: string;
}

export function Button({
    variant = 'primary',
    size = 'md',
    title,
    style,
    ...props
}: ButtonProps) {
    const buttonStyles: ViewStyle[] = [
        styles.base,
        styles[`${variant}Button`],
        styles[`${size}Button`],
        style as ViewStyle,
    ];

    const textStyles: TextStyle[] = [
        styles.baseText,
        styles[`${variant}Text`],
        styles[`${size}Text`],
    ];

    return (
        <TouchableOpacity style={buttonStyles} {...props}>
            <Text style={textStyles}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    baseText: {
        fontWeight: '600',
    },
    // Variants
    primaryButton: {
        backgroundColor: '#22c55e',
    },
    primaryText: {
        color: '#ffffff',
    },
    secondaryButton: {
        backgroundColor: '#f1f5f9',
    },
    secondaryText: {
        color: '#1e293b',
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    outlineText: {
        color: '#475569',
    },
    // Sizes
    smButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    smText: {
        fontSize: 14,
    },
    mdButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    mdText: {
        fontSize: 16,
    },
    lgButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    lgText: {
        fontSize: 18,
    },
});
