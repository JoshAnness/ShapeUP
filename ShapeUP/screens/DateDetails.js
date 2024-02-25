import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { format, parseISO } from 'date-fns';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

function DateDetails({ route }) {
  const { selectedDate } = route.params;
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const [exerciseInputs, setExerciseInputs] = useState({});
  const [visibleImages, setVisibleImages] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    fetchWorkoutDetails();
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      return () => saveExerciseInputs(); // This function is called when the screen is unfocused
    }, [exerciseInputs])
  );

  async function fetchWorkoutDetails() {
    const dayOfWeek = format(parseISO(selectedDate), 'EEEE');
    const q = query(collection(db, 'workouts'), where('assignedDays', 'array-contains', dayOfWeek));
    const querySnapshot = await getDocs(q);
    const workouts = [];
    for (const doc of querySnapshot.docs) {
      const workoutData = { id: doc.id, ...doc.data() };
      workoutData.exercisesWithImages = await fetchExercisesImages(workoutData.exercises);
      workouts.push(workoutData);
    }
    setWorkoutDetails(workouts);
    loadExerciseInputs(workouts);
  }

  async function fetchExercisesImages(exercises) {
    const storage = getStorage();
    return Promise.all(exercises.map(async (exercise) => {
      const images = await Promise.all([0, 1].map(async index => {
        const imageRef = ref(storage, `exercise_images/${exercise.replace(/\s+/g, '_').replace(/'/g, '').replace(/\//g, '_')}_${index}.jpg`);
        try {
          return await getDownloadURL(imageRef);
        } catch {
          return '';
        }
      }));
      return { name: exercise, images: images.filter(Boolean) };
    }));
  }

  async function loadExerciseInputs(workouts) {
    for (const workout of workouts) {
      const docRef = doc(db, "exerciseInputs", `${workout.id}_${format(parseISO(selectedDate), 'yyyy-MM-dd')}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setExerciseInputs(prev => ({ ...prev, [workout.id]: docSnap.data() }));
      }
    }
  }

  async function saveExerciseInputs() {
    for (const [workoutId, inputs] of Object.entries(exerciseInputs)) {
      const docRef = doc(db, "exerciseInputs", `${workoutId}_${format(parseISO(selectedDate), 'yyyy-MM-dd')}`);
      await updateDoc(docRef, inputs);
    }
  }

  function handleExerciseInput(workoutId, exerciseName, field, value) {
    setExerciseInputs(prev => ({
      ...prev,
      [workoutId]: {
        ...prev[workoutId],
        [exerciseName]: {
          ...prev[workoutId][exerciseName],
          [field]: value,
        },
      },
    }));
  }

  return (
    <ScrollView style={styles.container}>
      {workoutDetails.map(workout => (
        <View key={workout.id}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          {workout.exercisesWithImages.map((exercise, index) => (
            <View key={index} style={styles.exerciseContainer}>
              <TouchableOpacity onPress={() => setVisibleImages({ ...visibleImages, [`${workout.id}_${exercise.name}`]: !visibleImages[`${workout.id}_${exercise.name}`] })}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                {visibleImages[`${workout.id}_${exercise.name}`] && exercise.images.map((url, idx) => (
                  <Image key={idx} source={{ uri: url }} style={styles.image} />
                ))}
              </TouchableOpacity>
              <TextInput style={styles.input} placeholder="Sets" value={exerciseInputs[workout.id]?.[exercise.name]?.sets || ''} onChangeText={text => handleExerciseInput(workout.id, exercise.name, 'sets', text)} />
              <TextInput style={styles.input} placeholder="Reps" value={exerciseInputs[workout.id]?.[exercise.name]?.reps || ''} onChangeText={text => handleExerciseInput(workout.id, exercise.name, 'reps', text)} />
              <TextInput style={styles.input} placeholder="Max Weight" value={exerciseInputs[workout.id]?.[exercise.name]?.weight || ''} onChangeText={text => handleExerciseInput(workout.id, exercise.name, 'weight', text)} />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseContainer: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: (screenWidth - 40) / 2,
    height: 200,
    resizeMode: 'contain',
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
});

export default DateDetails;