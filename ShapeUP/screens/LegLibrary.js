import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LegLibrary = ({ navigation }) => {
    return (
        <Text style={styles.header}>Leg Library</Text>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f4f4f8'
    },
    header: {
        marginBottom: 5,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
    }
});

export default LegLibrary;