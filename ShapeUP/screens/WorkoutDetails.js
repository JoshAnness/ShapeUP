import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Button, Alert, TouchableOpacity } from 'react-native';
import { db } from '../firebase';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkoutDetails = ({ route, navigation }) => {
  const { workoutId } = route.params;
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    fetchWorkoutDetails();
  }, [workoutId]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        saveSelectedDays();
      };
      return onBackPress;
    }, [selectedDays])
  );

  const fetchWorkoutDetails = async () => {
    const docRef = doc(db, 'workouts', workoutId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setSelectedDays(data.assignedDays || []);
      const exercisesWithImages = await fetchExerciseImagesForWorkout(data);
      setWorkoutDetails({ ...data, exercises: exercisesWithImages });
    } else {
      console.log('No such workout document!');
    }
  };

  const fetchExerciseImagesForWorkout = async (workoutData) => {
    const storage = getStorage();
    return Promise.all(
      workoutData.exercises.map(async (exerciseName) => {
        const images = await fetchExerciseImages(exerciseName, storage);
        return { name: exerciseName, images };
      })
    );
  };

  const fetchExerciseImages = async (exerciseName, storage) => {
    const sanitizedExerciseName = exerciseName.replace(/\s+/g, '_').replace(/'/g, '').replace(/\//g, '_');
    const imageUrls = await Promise.all(
      [0, 1].map(async (index) => {
        const imageRef = ref(storage, `exercise_images/${sanitizedExerciseName}_${index}.jpg`);
        return getDownloadURL(imageRef).catch(() => null);
      })
    );
    return imageUrls.filter(url => url);
  };

  const handleDaySelection = (day) => {
    setSelectedDays(prevSelectedDays =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter(d => d !== day)
        : [...prevSelectedDays, day]
    );
  };

  const saveSelectedDays = async () => {
    const workoutRef = doc(db, 'workouts', workoutId);
    await updateDoc(workoutRef, {
      assignedDays: selectedDays
    });
  };

  if (!workoutDetails) {
    return <Text>Loading workout details...</Text>;
  }

  const deleteWorkout = async () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Yes", onPress: async () => {
            try {
              const workoutRef = doc(db, 'workouts', workoutId);
              await deleteDoc(workoutRef);
              navigation.goBack();
            } catch (error) {
              console.error("Error removing document: ", error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
        <ScrollView style={styles.container}>
        <Text style={styles.title}>{workoutDetails.name}</Text>
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => handleDaySelection(day)} 
              style={selectedDays.includes(day) ? styles.daySelected : styles.day}
            >
              <Text style={selectedDays.includes(day) ? styles.daySelectedText : {}}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {workoutDetails.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseContainer}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.images.map((image, imgIndex) => (
                <Image key={imgIndex} source={{ uri: image }} style={styles.exerciseImage} />
            ))}
            </View>
        ))}
        <View style={styles.buttonContainer}>
            <Button
                title="Delete Workout"
                onPress={deleteWorkout}
                color="#FF6347"
            />
            </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    paddingTop: -50,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 10,
    margin: 10,
    color: '#000',
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
    padding: 5,
    backgroundColor: '#f0f0f0',
    margin: 4,
  },
  daySelected: {
    padding: 10,
    backgroundColor: '#8337FE',
    margin: 4,
  },
  daySelectedText: {
    color: '#FFFFFF',
  },
});

export default WorkoutDetails;
