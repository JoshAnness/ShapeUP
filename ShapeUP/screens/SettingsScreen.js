import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';

const SettingsScreen = ({ navigation }) => {

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log('Logged out');
                navigation.replace('Login');
            })
            .catch((error) => {
                console.error('Error logging out:', error);
            });
    }

    return (
        <View style={styles.container}>
            
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BaselineTest')}>
                <Text>Baseline Test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text>Logout</Text>
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

export default SettingsScreen;
