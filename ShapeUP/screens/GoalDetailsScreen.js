// screens/GoalDetailsScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GoalDetailsScreen = ({ route }) => {
    const { goalId } = route.params;
    // Based on the goalId, you can fetch more detailed data either from local data or from a server.

    return (
        <View style={styles.container}>
            <Text>Details for Goal ID: {goalId}</Text>
            {/* Render more details here */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
    }
});

export default GoalDetailsScreen;
