import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BackLibrary = ({ navigation }) => {
    return (
        <Text style={styles.header}>Back Library</Text>
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

export default BackLibrary;