import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ArmLibrary = ({ navigation }) => {
    return (
        <View style={styles.container}>

        <Text style={styles.header}>Arm Library</Text>
        
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Tricep')}>
            <Text>Tricep</Text>
        </TouchableOpacity>

        </View>
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
    },
    button: {
        padding: 15,
        margin: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        alignItems: 'center'
    }
});

export default ArmLibrary;