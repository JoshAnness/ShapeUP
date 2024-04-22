import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Image, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { format, parseISO } from 'date-fns';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

function DateDetails({ route }) {
  const { selectedDate } = route.params;
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const [exerciseInputs, setExerciseInputs] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    fetchWorkoutDetails();
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      return () => saveExerciseInputs();
    }, [exerciseInputs])
  );

  async function fetchWorkoutDetails() {
    if (!auth.currentUser) {
      console.log("No user logged in");
      return;
    }
    const userId = auth.currentUser.uid;
    const dayOfWeek = format(parseISO(selectedDate), 'EEEE');
    const q = query(collection(db, 'workouts'), where('assignedDays', 'array-contains', dayOfWeek), where('userId', '==', userId));
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
      } else {
        setExerciseInputs(prev => ({ ...prev, [workout.id]: {} }));
      }
    }
  }

  async function saveExerciseInputs() {
    for (const [workoutId, inputs] of Object.entries(exerciseInputs)) {
      const docRef = doc(db, "exerciseInputs", `${workoutId}_${format(parseISO(selectedDate), 'yyyy-MM-dd')}`);
      await setDoc(docRef, inputs, { merge: true });
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {workoutDetails.map(workout => (
          <View key={workout.id}>
            <Text style={styles.workoutTitle}>{workout.name}</Text>
            {workout.exercisesWithImages.map((exercise, index) => (
              <View key={index} style={styles.exerciseContainer}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.imagesContainer}>
                  {exercise.images.map((url, idx) => (
                    <Image key={idx} source={{ uri: url }} style={styles.image} />
                  ))}
                </View>
                <TextInput style={styles.input} placeholder="Sets" value={exerciseInputs[workout.id]?.[exercise.name]?.sets || ''} onChangeText={text => handleExerciseInput(workout.id, exercise.name, 'sets', text)} />
                <TextInput style={styles.input} placeholder="Reps" value={exerciseInputs[workout.id]?.[exercise.name]?.reps || ''} onChangeText={text => handleExerciseInput(workout.id, exercise.name, 'reps', text)} />
                <TextInput style={styles.input} placeholder="Max Weight" value={exerciseInputs[workout.id]?.[exercise.name]?.weight || ''} onChangeText={text => handleExerciseInput(workout.id, exercise.name, 'weight', text)} />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginRight: 5,
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