// screens/ProfileScreen.js

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Button from '../components/Button';

const DATA = [
    {
        id: '1',
        title: 'Lose Weight',
        progress: 50
    },
    {
        id: '2',
        title: 'Build Muscle',
        progress: 30
    },
    // Add more mock data for testing
];

const Item = ({ title, progress, onPress }) => (
    <View style={styles.item}>
        <Text>{title}</Text>
        <View style={styles.progressBarContainer}>
            <View style={{ ...styles.progressBar, width: `${progress}%` }} />
        </View>
        <Button title="Details" onPress={onPress} />
    </View>
);

const ProfileScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Hello, John Doe</Text>  {/* Mock name for now */}
            <FlatList
                data={DATA}
                renderItem={({ item }) => (
                    <Item 
                        title={item.title} 
                        progress={item.progress} 
                        onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
                    />
                )}
                keyExtractor={item => item.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    header: {
        marginBottom: 20,
        fontSize: 18,
        fontWeight: 'bold'
    },
    item: {
        padding: 16,
        marginVertical: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center',
    },
    progressBarContainer: {
        height: 20,
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginVertical: 10
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 5
    }
});

export default ProfileScreen;
