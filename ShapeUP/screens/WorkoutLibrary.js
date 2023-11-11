import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WorkoutLibrary = ({ navigation }) => {
    return (
        <View style={styles.container}>
            
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chest')}>
                <Text>Chest workout Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Back')}>
                <Text>Back workout Library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Leg')}>
                <Text>Leg workout Library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Arm')}>
                <Text>Arm workout Library</Text>
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30
    },
    button: {
        padding: 15,
        margin: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        alignItems: 'center'
    }
});

export default WorkoutLibrary;