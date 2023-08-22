import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

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
    // More data...
];

const Item = ({ title, progress, onPress }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
        <Text style={styles.itemTitle}>{title}</Text>
        <View style={styles.progressBarContainer}>
            <View style={{ ...styles.progressBar, width: `${progress}%` }} />
        </View>
    </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.header}>Hello, John Doe</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f4f4f8',
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center'
    },
    header: {
        marginBottom: 40,  // Increased margin
        fontSize: 30,  // Bigger font
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
    },
    item: {
        width: '95%',  // Taking a bit more width
        padding: 25,  // Increased padding
        marginVertical: 12,  // More vertical spacing
        borderColor: '#ccc',
        borderWidth: 1.5,  // Slightly thicker border
        borderRadius: 12,  // Slightly larger border radius
        backgroundColor: '#ffffff',
        alignItems: 'center'
    },
    itemTitle: {
        fontSize: 22,  // Larger font
        fontWeight: '500',
        marginBottom: 15,  // A bit more space before the progress bar
        textAlign: 'center'
    },
    progressBarContainer: {
        height: 30,  // Taller progress bar
        width: '90%',
        backgroundColor: '#e0e0e0',
        borderRadius: 12  // Matches the item's border radius
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 12
    }
});

export default ProfileScreen;
