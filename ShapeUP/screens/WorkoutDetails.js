import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const WorkoutDetails = ({ route }) => {
    const { workoutId } = route.params;
    const [workoutDetails, setWorkoutDetails] = useState(null);

    useEffect(() => {
        const fetchWorkoutDetails = async () => {
            try {
                const docRef = doc(db, 'workouts', workoutId);
                const docSnap = await getDoc(docRef);
        
                if (docSnap.exists()) {
                    let data = docSnap.data();
                    if (data.exercises) {
                        data = await fetchExerciseImagesForWorkout(data); // Await for images and update data
                        setWorkoutDetails(data);
                    } else {
                        console.log('No exercises field in the document');
                        setWorkoutDetails(data); // Set data even if exercises are not present
                    }
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error("Error fetching workout details:", error);
            }
        };

        fetchWorkoutDetails();
    }, [workoutId]);

    const fetchExerciseImagesForWorkout = async (workoutData) => {
        const storage = getStorage();
        const exercisesWithImages = await Promise.all(
            workoutData.exercises.map(async (exerciseName) => {
                const images = await fetchExerciseImages(exerciseName, storage);
                return { name: exerciseName, images };
            })
        );
        return {
            ...workoutData,
            exercises: exercisesWithImages
        };
    };

    const fetchExerciseImages = async (exerciseName, storage) => {
        const sanitizedExerciseName = exerciseName.replace(/\s+/g, '_').replace(/'/g, '');
        const imageUrls = await Promise.all(
            [0, 1].map(async (index) => {
                const imageRef = ref(storage, `exercise_images/${sanitizedExerciseName}_${index}.jpg`);
                return getDownloadURL(imageRef).catch(() => null); // Return null if image not found
            })
        );
        return imageUrls.filter(url => url !== null); // Filter out any null URLs
    };

    if (!workoutDetails) {
        return <Text>Loading workout details...</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{workoutDetails.name}</Text>
            {workoutDetails.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseContainer}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {exercise.images.map((image, imgIndex) => (
                        <Image key={imgIndex} source={{ uri: image }} style={styles.exerciseImage} />
                    ))}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
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