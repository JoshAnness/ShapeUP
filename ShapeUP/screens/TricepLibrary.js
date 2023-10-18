import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TricepLibrary = ({ navigation }) => {
    return (
        <View style={styles.container}>
        <Text>
            "name": "EZ-Bar Skullcrusher",
            "force": "push",
            "level": "beginner",
            "mechanic": "isolation",
            "equipment": "e-z curl bar",
            "primaryMuscles": [
            "triceps"],
            "secondaryMuscles": [
            "forearms"
            ],
            "instructions": [
            "Using a close grip, lift the EZ bar and hold it with your elbows in as you lie on the bench. Your arms should be perpendicular to the floor. This will be your starting position.",
            "Keeping the upper arms stationary, lower the bar by allowing the elbows to flex. Inhale as you perform this portion of the movement. Pause once the bar is directly above the forehead.",
            "Lift the bar back to the starting position by extending the elbow and exhaling.",
            "Repeat."
            ],
            "category": "strength"
        </Text>
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
    }
});

export default TricepLibrary;