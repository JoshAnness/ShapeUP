import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const WorkoutDetails = ({ route, navigation }) => {
    const { workoutId } = route.params;
    const [workoutDetails, setWorkoutDetails] = useState(null);

    useEffect(() => {
        const fetchWorkoutDetails = async () => {
            try {
                const docRef = doc(db, 'workouts', workoutId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setWorkoutDetails(docSnap.data());
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error("Error fetching workout details:", error);
            }
        };

        fetchWorkoutDetails();
    }, [workoutId]);

    if (!workoutDetails) {
        return <Text>Loading workout details...</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{workoutDetails.name}</Text>
            {workoutDetails.exercises && workoutDetails.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseContainer}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {exercise.images && exercise.images.map((image, imgIndex) => (
                        <Image key={imgIndex} source={{ uri: image }} style={styles.exerciseImage} />
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    backButton: {
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
    },
    backButtonText: {
        textAlign: 'center',
        color: '#000',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 10,
    },
    exerciseContainer: {
        marginBottom: 20,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 10,
    },
    exerciseImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
    },
});

export default WorkoutDetails;