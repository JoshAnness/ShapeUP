import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { db } from '../firebase';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkoutDetails = ({ route, navigation }) => {
    const { workoutId } = route.params;
    const [workoutDetails, setWorkoutDetails] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);

    useEffect(() => {
        const fetchWorkoutDetails = async () => {
            try {
                const docRef = doc(db, 'workouts', workoutId);
                const docSnap = await getDoc(docRef);
    
                if (docSnap.exists()) {
                    let data = docSnap.data();
                    setSelectedDays(data.assignedDays || []);
    
                    if (Array.isArray(data.exercises)) {
                        const exercisesWithImages = await fetchExerciseImagesForWorkout(data);
                        setWorkoutDetails({...data, exercises: exercisesWithImages});
                    } else {
                        setWorkoutDetails({...data, exercises: []});
                    }
                } else {
                    console.log('No such workout document!');
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
            (workoutData.exercises || []).map(async (exerciseName) => {
                const images = await fetchExerciseImages(exerciseName, storage);
                return { name: exerciseName, images: images };
            })
        );
        return exercisesWithImages;
    };

    const fetchExerciseImages = async (exerciseName, storage) => {
        const sanitizedExerciseName = exerciseName.replace(/\s+/g, '_').replace(/'/g, '').replace(/\//g, '_');
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

    const handleDaySelection = async (day) => {
        let newSelectedDays;
        if (selectedDays.includes(day)) {
            newSelectedDays = selectedDays.filter(d => d !== day);
        } else {
            newSelectedDays = [...selectedDays, day];
        }
        setSelectedDays(newSelectedDays);
    
        const workoutRef = doc(db, 'workouts', workoutId);
        try {
            await updateDoc(workoutRef, {
                assignedDays: newSelectedDays
            });
            console.log('Workout days updated successfully');
        } catch (error) {
            console.error('Error updating workout days: ', error);
        }
    };

    const handleAssignDays = () => {
        navigation.navigate('CalendarIn', { workoutId, selectedDays });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{workoutDetails.name}</Text>
            <View style={styles.daysContainer}>
                {daysOfWeek.map((day, index) => (
                    <TouchableOpacity key={index} onPress={() => handleDaySelection(day)} style={selectedDays.includes(day) ? styles.daySelected : styles.day}>
                        <Text>{day}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView style={styles.container}>
                {workoutDetails.exercises.map((exercise, index) => (
                    <View key={index} style={styles.exerciseContainer}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        {exercise.images.map((image, imgIndex) => (
                            <Image key={imgIndex} source={{ uri: image }} style={styles.exerciseImage} />
                        ))}
                    </View>
                ))}
            </ScrollView>
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
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    day: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        margin: 4,
    },
    daySelected: {
        padding: 10,
        backgroundColor: '#007bff',
        margin: 4,
    },
    assignButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        alignItems: 'center',
        borderRadius: 5,
    },
});

export default WorkoutDetails;