import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { db } from '../firebase';
import { query, where, getDocs, collection } from 'firebase/firestore';

const DateDetails = ({ route }) => {
    const { selectedDate } = route.params;
    const [workoutData, setWorkoutData] = useState([]);

    useEffect(() => {
        const fetchWorkoutData = async () => {
            try {
                const workoutRef = collection(db, 'workoutDetails');
                const q = query(workoutRef, where('date', '==', selectedDate));
                const querySnapshot = await getDocs(q);

                const data = [];
                querySnapshot.forEach((doc) => {
                    data.push(doc.data());
                });

                console.log('Fetched workout data:', data);

                setWorkoutData(data);
            } catch (error) {
                console.error('Error fetching workout data: ', error);
            }
        };

        fetchWorkoutData();
    }, [selectedDate]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Workouts for {selectedDate}</Text>
            {workoutData.length > 0 ? (
                workoutData.map((workout, index) => (
                    <View key={index} style={styles.workoutContainer}>
                        <Text style={styles.workoutName}>{workout.name}</Text>
                        <Text style={styles.workoutSetsReps}>Sets and Reps:</Text>
                        {Object.entries(workout.setsRepsData).map(([exerciseName, exerciseData]) => (
                            <View key={exerciseName} style={styles.exerciseContainer}>
                                <Text>{exerciseName}</Text>
                                <Text>Sets: {exerciseData.sets}</Text>
                                <Text>Reps: {exerciseData.reps}</Text>
                            </View>
                        ))}
                        <Text style={styles.workoutWeight}>Weight:</Text>
                        {Object.entries(workout.weightData).map(([exerciseName, weight]) => (
                            <View key={exerciseName} style={styles.exerciseContainer}>
                                <Text>{exerciseName}</Text>
                                <Text>Weight: {weight}</Text>
                            </View>
                        ))}
                    </View>
                ))
            ) : (
                <Text>No workouts found for this date</Text>
            )}
        </ScrollView>
    );
};

const styles = {
    container: {
        padding: 20,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
    },
    workoutContainer: {
        marginBottom: 20,
    },
    workoutName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    workoutSetsReps: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    workoutWeight: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    exerciseContainer: {
        marginBottom: 10,
    },
};

export default DateDetails;